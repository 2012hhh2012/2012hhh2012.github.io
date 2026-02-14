(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Extra Window Controls must run unsandboxed');
  }

  class ExtraWindowControls {
    getInfo() {
      return {
        id: '2012hhh2012ExtraWindowControls',
        color1: "#359ed4",
        color2: "#298ec2",
        color3: "#2081b3",
        name: 'Extra Window Controls',
        blocks: [
          {
            opcode: 'canUseNode',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'can use node.js?'
          },
          {
            opcode: 'getTitleBarHeight',
            blockType: Scratch.BlockType.REPORTER,
            text: 'title bar height'
          },
          "---",
          {
            opcode: 'nodeSetWindow',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window x:[X] y:[Y] w:[W] h:[H] (node)',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 }
            }
          },
          {
            opcode: 'SetWindow',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window x: [X] y: [Y] w: [W] h: [H]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 }
            }
          },
          "---",
          {
            opcode: 'nodeOpenFile',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Open file [PATH] in a new window (node)',
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'index.html' }
            }
          },
          "---",
          {
            opcode: 'nodeMinimizeWindow',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Minimize Window (node)'
          },
          {
            opcode: 'nodeMaximize',
            blockType: Scratch.BlockType.COMMAND,
            text: 'maximize window (node)'
          },
          {
            opcode: 'nodeUnmaximize',
            blockType: Scratch.BlockType.COMMAND,
            text: 'unmaximize / restore window (node)'
          }
        ]
      };
    }

    canUseNode() {
      // Checks if we are in an environment that supports 'require' (Electron/Node)
      return (typeof require !== 'undefined');
    }

    getTitleBarHeight() {
      // Returns the difference between the whole window and the game area
      return window.outerHeight - window.innerHeight;
    }

    nodeMaximize() {
      if (typeof require !== 'undefined') {
        require('electron').ipcRenderer.send('window-maximize');
      } else {
        console.warn("Electron not detected. Cannot maximize.");
      }
    }

    nodeUnmaximize() {
      if (typeof require !== 'undefined') {
        require('electron').ipcRenderer.send('window-unmaximize');
      } else {
        console.warn("Electron not detected. Cannot unmaximize.");
      }
    }

    nodeSetWindow(args) {
      if (typeof require !== 'undefined') {
        require('electron').ipcRenderer.send('window-set-all', {
          x: Math.round(args.X),
          y: Math.round(args.Y),
          w: Math.round(args.W),
          h: Math.round(args.H)
        });
      } else {
        console.warn("Electron not detected. Cannot set window position.");
      }
    }

    SetWindow(args) {
      const x = Number(args.X) || 0;
      const y = Number(args.Y) || 0;
      const w = Number(args.W) || 480;
      const h = Number(args.H) || 360;

      // Uses standard Browser Web APIs
      window.moveTo(x, y);
      window.resizeTo(w, h);
    }

    nodeMinimizeWindow() {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('window-minimize');
      } else {
        console.warn("Electron not detected. Cannot minimize.");
      }
    }
    
    nodeOpenFile(args) {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        // Changed args.FILE to args.PATH to match getInfo above
        ipcRenderer.send('window-open-new-window', args.PATH);
      } else {
        console.warn("Electron not detected. Cannot open new window.");
      }
    }
  }
  Scratch.extensions.register(new ExtraWindowControls());
})(Scratch);