


const kissiGifi = [
  'https://media.tenor.com/hYq-uxUwOG4AAAAj/mochi-mochimochi.gif',
'https://media.tenor.com/L5EUB2LSEBgAAAAi/mochi-cat-flop.gif',
'https://media.tenor.com/Nt17bFLryGYAAAAi/love-cat.gif',
'https://media.tenor.com/dBuCk1xnXj8AAAAi/peach-and-goma-love-lift-up.gif',
'https://media.tenor.com/MeZYpkc_q-oAAAAi/catkiss.gif',
'https://media.tenor.com/s0UUW0sKVFoAAAAi/tkthao219-peach.gif',
'https://media.tenor.com/ZT0808KDKS8AAAAi/mochi-mochi-peach-cat-cat.gif',
'https://media.tenor.com/SiqVtvrB0PwAAAAi/mochi-cat.gif',
'https://media.tenor.com/2m4l360ccV4AAAAi/heart.gif'
]

function toggle() {
  var gifToast = document.getElementById('gif-toast');
  gifToast.classList.toggle("gif-toast-wrapper-hide");
}

var showInProgress = false;

function showKissi() {
  
  if (showInProgress) {
    return;
  }
  document.getElementById('gif-img').src = kissiGifi[(Math.floor(Math.random() * kissiGifi.length))]
  showInProgress = true;
  toggle();
  setTimeout(() => {
    toggle();
    setTimeout(() => {
      showInProgress = false;
    }, 1000);
  }, 3500);
}

function showSteve() {
  
  if (showInProgress) {
    return;
  }
  document.getElementById('gif-img').src = 'icon.png'
  showInProgress = true;
  toggle();
  setTimeout(() => {
    toggle();
    setTimeout(() => {
      showInProgress = false;
    }, 1000);
  }, 3500);
}

var tetris = null;
function showTetris() {
  alert('Arrow keys to move, space to rotate');

  // remove tetris hide class from tetris-toast
  document.getElementById('tetris-toast').classList.remove('tetris-toast-wrapper-hide');

  tetris = new Tetris();

tetris.startStep();


}

function hideTetris() {
  if (!tetris) {
    return;
  }
  // add tetris hide class from tetris-toast
  document.getElementById('tetris-toast').classList.add('tetris-toast-wrapper-hide');
  // stoop game

  tetris.stopStep();
  tetris = null;
}

function Code() {

    const maxSequenceLength = 20;
    
    const listeners = {};
    
    var sequence = '';
    
    window.addEventListener('keydown', (ev) => {

      // on escape
      if (ev.key === 'Escape') {
        hideTetris();
        sequence = '';
        return;
      }
  
      if (ev.key.length > 1) {
        return;
      }
      
      sequence += ev.key;
      
      if (sequence.length > maxSequenceLength) {
        sequence = sequence.substring(1, sequence.length);
      }
      
      sequence = sequence.toUpperCase();
      
      checkSequence();
      
    });
    
    function checkSequence() {
      Object.keys(listeners).forEach((key) => {
        if (sequence.includes(key)) {
          sequence = '';
          listeners[key]();
        }
      }); 
    }
    
    this.on = function(sequ, handler) {
        // check if sequ is a string
        if (typeof sequ !== 'string') {
            throw new Error('The sequence must be a string');
        }

        // check if sequ is not empty
        if (sequ.length === 0) {
            throw new Error('The sequence must not be empty');
        }

        // check if handler is a function
        if (typeof handler !== 'function') {
            throw new Error('The handler must be a function');
        }

        // check if sequ is not already in the listeners
        if (listeners[sequ.toUpperCase()]) {
            throw new Error('The sequence is already registered');
        }

        // add the listener
        listeners[sequ.toUpperCase()] = handler;
    }.bind(this);
   
    this.generateHelp = function() {
      return 'This are the secret modes you can activate when you type it on your keyboard ❤\n\n' + Object.keys(listeners).map(el => '- ' + el).join('\n') + '\n\nEnjoy!\nPS: You can stop games by pressing ESC'; 
    }.bind(this);

    return this;
    
  }
  
  var c = new Code();
  
  c.on('TETRISPLS', () => {
    // alert tetris controls, arrow keys, space
    showTetris();
  });

  c.on('KISSI', () => {
    showKissi();
  });

  
c.on('STEVE', () => {
  showSteve();
});

  c.on('HELP', () => {
    alert(c.generateHelp());
  });
