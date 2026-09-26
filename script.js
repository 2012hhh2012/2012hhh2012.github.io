const GITHUB_USERNAME = '2012hhh2012';
const REPO_NAME = '2012hhh2012.github.io';
const BRANCH_NAME = 'main';
const API_BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents`;

// --- IGNORE LIST (like .gitignore) ---
const IGNORE = [
    '.gitattributes',
    '.git',
    '.gitignore',
    'index.html',
    'index2.html',
    'styles.css',
    'TurboConnect.sb3',
    'funny.png'
];

// --- Fetch and display expandable file tree ---
async function fetchAndDisplayFileStructure(path = '', parentUl = null) {
    const url = path ? `${API_BASE_URL}/${path}?ref=${BRANCH_NAME}` : `${API_BASE_URL}?ref=${BRANCH_NAME}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();
        if (!Array.isArray(files)) throw new Error('Invalid response');

        files.sort((a, b) => {
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
        });

        const ul = parentUl || document.createElement('ul');
        if (!parentUl) document.getElementById('file-list').innerHTML = '<h2>Root Folder (/) Contents</h2>';

        files.forEach(async item => {
            if (IGNORE.includes(item.name)) return;

            const li = document.createElement('li');
            const isDir = item.type === 'dir';
            let isLFS = false;
            let downloadUrl = '';

            if (!isDir) {
                // Try to detect LFS pointer
                if (!item.download_url) {
                    // If no download_url, assume it could be LFS
                    downloadUrl = `https://media.githubusercontent.com/media/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH_NAME}/${item.path}`;
                    isLFS = true;
                } else {
                    // Fetch small file content to check for LFS pointer
                    try {
                        const contentResp = await fetch(item.download_url);
                        if (contentResp.ok) {
                            const text = await contentResp.text();
                            if (text.startsWith('version https://git-lfs.github.com/spec/v1')) {
                                isLFS = true;
                                downloadUrl = `https://media.githubusercontent.com/media/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH_NAME}/${item.path}`;
                            } else {
                                downloadUrl = item.download_url;
                            }
                        } else {
                            downloadUrl = item.download_url;
                        }
                    } catch (err) {
                        console.warn('Could not check LFS for', item.name, err);
                        downloadUrl = item.download_url;
                    }
                }
            }

            li.innerHTML = `
                <span class="icon ${isDir ? 'dir-icon' : 'file-icon'}"></span>
                <a href="${isDir ? '#' : item.html_url}" target="${isDir ? '' : '_blank'}">
                    ${item.name}${isDir ? '/' : ''}
                    ${isLFS ? '<span style="color:#6f42c1;font-weight:bold;margin-left:6px;">[LFS]</span>' : ''}
                </a>
                ${!isDir && downloadUrl ? `<a href="${downloadUrl}" class="download-btn" download="${item.name}">Download</a>` : ''}
            `;

            if (isDir) {
                const nestedUl = document.createElement('ul');
                nestedUl.classList.add('nested');
                li.appendChild(nestedUl);

                li.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    li.classList.toggle('expanded');
                    if (!nestedUl.hasChildNodes()) {
                        await fetchAndDisplayFileStructure(item.path, nestedUl);
                    }
                });
            }

            ul.appendChild(li);
        });

        if (!parentUl) document.getElementById('file-list').appendChild(ul);

    } catch (error) {
        console.error('Error fetching file structure:', error);
        if (!parentUl) document.getElementById('file-list').innerHTML = `<p class="status-failure">Failed to load file structure: ${error.message}</p>`;
    }
}

// --- Fetch and display last deployment ---
async function fetchAndDisplayLastDeploy() {
    const deployStatusDiv = document.getElementById('deploy-status');
    const workflowsUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/actions/runs?branch=${BRANCH_NAME}&per_page=1`;

    try {
        const response = await fetch(workflowsUrl);
        if (!response.ok) {
            deployStatusDiv.innerHTML = `<p><strong>Last Deploy Status:</strong> Not configured or repository private. (HTTP ${response.status})</p>`;
            return;
        }
        const data = await response.json();
        if (data.workflow_runs?.length > 0) {
            const latestRun = data.workflow_runs[0];
            const statusClass = getStatusClass(latestRun.conclusion);
            const date = new Date(latestRun.created_at).toLocaleString();
            deployStatusDiv.innerHTML = `
                <h2>Last Deployment Status</h2>
                <p><strong>Status:</strong> <span class="${statusClass}">${latestRun.conclusion || 'In Progress'}</span></p>
                <p><strong>Workflow:</strong> ${latestRun.name}</p>
                <p><strong>Triggered At:</strong> ${date}</p>
                <p><strong>Check Run:</strong> <a href="${latestRun.html_url}" target="_blank">View Run Details</a></p>
            `;
        } else {
            deployStatusDiv.innerHTML = `<p><strong>Last Deployment Status:</strong> No recent workflow runs found.</p>`;
        }
    } catch (error) {
        console.error('Error fetching deployment status:', error);
        deployStatusDiv.innerHTML = `<p class="status-failure">Failed to load deployment status: ${error.message}</p>`;
    }
}

function getStatusClass(conclusion) {
    if (!conclusion) return 'status-in-progress';
    switch (conclusion.toLowerCase()) {
        case 'success': return 'status-success';
        case 'failure': return 'status-failure';
        case 'cancelled': return 'status-pending';
        default: return 'status-in-progress';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFileStructure();
    fetchAndDisplayLastDeploy();
});