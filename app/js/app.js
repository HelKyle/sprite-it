const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith');
const path = require('path');


function GulpRunner() {
  this.spritesMithConfig = {
  		//Retina图，必须保证图片是原来的两倍大，所有图片都需要有2x的大小
  		// retinaSrcFilter: './src/image/sprite/*@2x.png',

  		//$$$$$$$$$$$输出结果
  		imgName: 'sprite.png',
  	  cssName: 'sprite.css',
  	  cssFormat: 'css',
  	  // cssTemplate: 'css.template.mustache',

  	  // top-down	left-right	diagonal	alt-diagonal	binary-tree
	    algorithm: 'binary-tree',
	    padding: 6,
  		// retinaImgName: 'spritesheet-2x.png',
  }
}

GulpRunner.prototype.pipePromise = function(stream, dir) {
  return new Promise(function(resolve) {
     return stream.pipe(gulp.dest(dir)).on('end', resolve);
  })
}

GulpRunner.prototype.sprite = function(options, src, dir) {
  let config = Object.assign({}, this.spritesMithConfig, options);
  config.padding = parseInt(config.padding, 10);
  config.imgName = config.imgName.split('.')[0] + '.png';
  config.cssName = config.cssName.split('.')[0] + '.' + config.cssFormat;

  let spriteData = gulp.src(src) // source path of the sprite images
      .pipe(spritesmith(config));

  return Promise.all([
    this.pipePromise(spriteData.img, dir),
    this.pipePromise(spriteData.css, dir)
  ])
}

function addListenerMulti(el, s, fn) {
  s.split(' ').forEach((e) => {
    el.addEventListener(e, fn.bind(el), false)
  });
}

let directive = {};
function registerDirective(key, val, func) {
  Object.defineProperty(directive, key, {
    get: function() {
      return val;
    },
    set: function(newVal) {
      val = newVal;
      func(newVal)
    }
  })
}

(function() {
  let dropInBox = document.querySelector('.drop-in-box');
  let doneBox = document.querySelector('.done-box');
  let sidebar = document.querySelector('.sidebar');
  let operateBtn = document.querySelector('.operate-btn');

  let algorithm = document.querySelector('#algorithm');
  let language = document.querySelector('#language');
  let padding = document.querySelector('#padding');
  let prefixer = document.querySelector('#prefixer');
  let imgName = document.querySelector('#img-name');
  let cssName = document.querySelector('#css-name');


  function getFormData() {
    return {
      algorithm: algorithm.value,
      cssFormat: language.value,
      padding: padding.value || 0,
      prefixer: prefixer.value || 'sprites-',
      imgName: imgName.value  || 'sprites',
      cssName: cssName.value || 'sprites'
    }
  }

  registerDirective('step', '', function(newVal) {
    if (newVal == 'step-1') {
      doneBox.classList.remove('ishow');
      doneBox.classList.remove('entry');

      dropInBox.classList.add('ishow');
      setTimeout(function() {
        dropInBox.classList.add('entry');
      }, 10);
    } else if (newVal == 'step-2') {
      dropInBox.classList.remove('ishow');
      dropInBox.classList.remove('entry');

      doneBox.classList.add('ishow');
      setTimeout(function() {
        doneBox.classList.add('entry');
      }, 10);
    }
  })

  directive.step = 'step-1';

  let gulpRunner = new GulpRunner();
  function preventDefault() {
    addListenerMulti(document, 'dragend dragover dragenter dragleave drop', function(event) {
      event.preventDefault();
      event.stopPropagation();
    })
  }
  preventDefault();

  addListenerMulti(dropInBox, 'dragover dragenter', function(event) {
    this.classList.add('is-dragover');
  })

  addListenerMulti(dropInBox, 'dragleave dragend drop', function(event) {
    this.classList.remove('is-dragover');
  })

  addListenerMulti(dropInBox, 'drop', function(event) {
    let files = event.dataTransfer.files;
    let src = [];

    let dir = path.parse(files[0].path).dir;

    [].forEach.call(files, (file) => {
      src.push(file.path);
    })

    gulpRunner.sprite(getFormData(), src, dir).then(() => {
      dropInBox.classList.remove('is-dragover');

      directive.step = 'step-2';

      setTimeout(function() {
        directive.step = 'step-1';
      }, 1000);
    });

    return false;
  })
  addListenerMulti(operateBtn, 'click', function(event) {
    sidebar.classList.toggle('open')
  })
})();
