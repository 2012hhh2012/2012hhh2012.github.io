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
          "---",
          {
            opcode: 'nodeSetWindow',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window x:[X] y:[Y] w:[W] h:[H] (node)',
            arguments: {
              X: { type: 'number', defaultValue: 0 },
              Y: { type: 'number', defaultValue: 0 },
              W: { type: 'number', defaultValue: 480 },
              H: { type: 'number', defaultValue: 360 }
            }
          },
          "---",
          {
            opcode: 'nodeSetX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window x to [X] (node)',
            arguments: { X: { type: 'number', defaultValue: 0 } }
          },
          {
            opcode: 'nodeSetY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window y to [Y] (node)',
            arguments: { Y: { type: 'number', defaultValue: 0 } }
          },
          {
            opcode: 'nodeSetW',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window width to [W] (node)',
            arguments: { W: { type: 'number', defaultValue: 480 } }
          },
          {
            opcode: 'nodeSetH',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set window height to [H] (node)',
            arguments: { H: { type: 'number', defaultValue: 360 } }
          },
          "---",
          {
            opcode: 'nodeChangeX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change window x by [X] (node)',
            arguments: { X: { type: 'number', defaultValue: 10 } }
          },
          {
            opcode: 'nodeChangeY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change window y by [Y] (node)',
            arguments: { Y: { type: 'number', defaultValue: 10 } }
          },
          {
            opcode: 'nodeChangeW',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change window width by [W] (node)',
            arguments: { W: { type: 'number', defaultValue: 10 } }
          },
          {
            opcode: 'nodeChangeH',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change window height by [H] (node)',
            arguments: { H: { type: 'number', defaultValue: 10 } }
          },
          "---",
          {
            opcode: 'nodeopenfile',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Open file [PATH] in a new window (node)',
            arguments: {
              PATH: { type: 'string', defaultValue: 'index.html' }
            }
          },
          "---",
          {
            opcode: 'nodeminimizeWindow',
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

    nodeMaximize() {
      if (typeof require !== 'undefined') {
        require('electron').ipcRenderer.send('window-maximize');
      }
    }

    nodeUnmaximize() {
      if (typeof require !== 'undefined') {
        require('electron').ipcRenderer.send('window-unmaximize');
      }
    }

    nodeSetWindow(args) {
      this._send('update-all', {
        x: Math.round(args.X),
        y: Math.round(args.Y),
        w: Math.round(args.W),
        h: Math.round(args.H)
      });
    }

    nodeSetX(args) { this._send('set-async', { type: 'x', value: args.X }); }
    nodeSetY(args) { this._send('set-async', { type: 'y', value: args.Y }); }
    nodeSetW(args) { this._send('set-async', { type: 'w', value: args.W }); }
    nodeSetH(args) { this._send('set-async', { type: 'h', value: args.H }); }

    _send(channel, payload) {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send(`window-${channel}`, payload);
      }
    }
    
    nodeChangeX(args) { this._sendMove('x', args.X); }
    nodeChangeY(args) { this._sendMove('y', args.Y); }
    nodeChangeW(args) { this._sendMove('w', args.W); }
    nodeChangeH(args) { this._sendMove('h', args.H); }

    _sendMove(type, value) {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('window-move-async', { type, value });
      }
    }

    async openfile(args) {
      if (await Scratch.canOpenWindow(args.PATH)) {
        await Scratch.openWindow(args.PATH, 'width=400,height=400');
      } else {
        console.error("TurboWarp blocked the popup.");
        alert("TurboWarp blocked the popup.");
      }
    }

    nodeopenfile(args) {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        // Changed args.FILE to args.PATH to match getInfo above
        ipcRenderer.send('open-new-window', args.PATH);
      } else {
        console.warn("Electron not detected. Cannot open new window.");
      }
    }

    nodeminimizeWindow() {
      if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('minimize-window');
      } else {
        console.warn("Electron not detected. Cannot minimize.");
      }
    }
    
  }
  Scratch.extensions.register(new ExtraWindowControls());
})(Scratch);