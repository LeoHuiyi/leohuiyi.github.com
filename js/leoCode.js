var leoCode = {
    leoLoad: {
        load: function(path, callback) {
            var head = document.getElementsByTagName('head')[0];
            var s = document.createElement('script');
            var dfd = $.Deferred();

            s.src = path;
            s.async = true;
            head.appendChild(s);

            s.onload = s.onreadystatechange = function(_, isAbort) {
                s.parentNode.removeChild(s);
                if (isAbort || !s.readyState || s.readyState == "loaded" || s.readyState == "complete") {
                    s = s.onload = s.onreadystatechange = null;
                    if (!isAbort) {
                        dfd.resolve();
                        callback && callback();
                    } else {
                        dfd.reject();
                    }
                } else {
                    dfd.reject();
                }
            };

            return dfd;
        },
        loadAll: function(pathArr) {
            if (pathArr.length) {
                return $.when.apply(null, pathArr.map(function(path) {
                    return this.load(path);
                }.bind(this)));
            }
        }
    },

    utils: {
        getUrlObj: function() {
            var args = {};
            var match = null;
            var search = decodeURIComponent(location.search.substring(1));
            var reg = /(?:([^&]+)=([^&]+))/g;

            while ((match = reg.exec(search)) !== null) {
                if (match[2] === 'true') {
                    args[match[1]] = true;
                } else if (match[2] === 'false') {
                    args[match[1]] = false;
                } else {
                    args[match[1]] = match[2];
                }
            }

            return args;
        },

        htmlEncode: function(str) {
            return $('<div/>').text(str).html();
        },

        htmlDecode: function(str) {
            return $('<div/>').html(str).text();
        },

        getCodeStr: function(op) {
            var option = $.extend({}, op),
                index,
                htmlStr = $.trim(option.html) || '',
                cssStr = $.trim(option.css),
                jsStr = $.trim(option.js);

            if (jsStr) {
                index = htmlStr.indexOf('</body>');
                if (index > -1) {
                    htmlStr = htmlStr.slice(0, index) + '<script>try{' + jsStr + '}catch(e){}</script>' + htmlStr.slice(index);
                } else {
                    htmlStr += '<script>try{' + jsStr + '}catch(e){}</script>';
                }
            }

            if (cssStr) {
                index = htmlStr.indexOf('</body>');
                if (index > -1) {
                    htmlStr = htmlStr.slice(0, index) + '<style>' + cssStr + '</style>' + htmlStr.slice(index);
                } else {
                    htmlStr += '<style>' + cssStr + '</style>';
                }
            }

            return htmlStr;
        }
    },

    ajaxData: function(url) {
        return $.ajax({
            url: url,
            type: 'GET',
            dataType: 'text'
        });
    },

    getLeoCodeOption: function() {
        var utils = this.utils,
            op = utils.getUrlObj(),
            option = $.extend({
                mode: 'editorAll', //editorAll, preview
                loadUrlArr: ['js/lib/ace/ace.js', 'js/lib/js-beautify/beautify-html.js', 'js/lib/js-beautify/beautify-css.js', 'js/lib/js-beautify/beautify.js'],
                htmlDfd: '',
                cssDfd: '',
                jsDfd: '',
                isShake: true,
                isBlast: true,
                isRunCode: true,
                isFullScreen: false,
                isHelpShow: false,
            }, op);

        if (option.htmlUrl) {
            option.htmlDfd = this.ajaxData(option.htmlUrl);
        }

        if (option.cssUrl) {
            option.cssDfd = this.ajaxData(option.cssUrl);
        }

        if (option.jsUrl) {
            option.jsDfd = this.ajaxData(option.jsUrl);
        }

        return option;
    },

    getEditor: function() {
        var leoLoad = this.leoLoad;

        function Editor(ace, op) {
            var defaultOp = {
                mode: 'ace/mode/html',
                theme: 'ace/theme/monokai',
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
                enableEmmet: true,
                fontSize: '16px',
                printMargin: false,
                leoSetFullScreen: true,
                leoSetShowSettingsMenu: true,
                leoBlastCode: true
            };

            if (!ace || !op.id) {
                return false;
            }

            this.ace = ace;
            this.options = $.extend({}, defaultOp, op);
            this.init();
        }

        $.extend(Editor.prototype, {
            init: function() {
                var op = this.options,
                    editor = this.editor = this.ace.edit(op.id);

                this.setLanguageTools().setEmmet().setSnippet().setFullScreen().setShowSettingsMenu().setBeautifyCode().setSaveCode().setBlastCode();
                editor.setOptions(this._getEditorOp());
                editor.getSession().setUseWrapMode(true);

                return this;
            },
            _getEditorOp: function() {
                var newOp = {},
                    op = this.options;

                Object.keys(this.editor.$options).forEach(function(option) {
                    op[option] && (newOp[option] = op[option]);
                });

                return newOp;
            },
            _setOp: function(defaultOpArr) {
                if (defaultOpArr.length) {
                    var op = this.options,
                        newOp = {},
                        i = 0;

                    defaultOpArr.forEach(function(prop) {
                        if (typeof op[prop] !== 'undefined') {
                            newOp[prop] = op[prop];
                            i++;
                            delete op[prop];
                        }
                    });

                    if (i > 0) {
                        return newOp;
                    }
                }
            },
            setLanguageTools: function() {
                var editor = this.editor,
                    languageToolsOp = this._setOp(['enableBasicAutocompletion', 'enableLiveAutocompletion', 'enableSnippets']);

                if (languageToolsOp) {
                    this.ace.config.loadModule("ace/ext/language_tools", function() {
                        editor.setOptions(languageToolsOp);
                    });
                }

                return this;
            },
            setShowSettingsMenu: function() {
                var editor = this.editor,
                    showSettingsMenuOp = this._setOp(['leoSetShowSettingsMenu']);

                if (showSettingsMenuOp && showSettingsMenuOp.leoSetShowSettingsMenu) {
                    var ace = this.ace;

                    ace.config.loadModule("ace/ext/settings_menu", function() {
                        ace.require('ace/ext/settings_menu').init(editor);

                        editor.commands.addCommands([{
                            name: "showSettingsMenu",
                            bindKey: {
                                win: "Ctrl-q",
                                mac: "Command-q"
                            },
                            exec: function(editor) {
                                editor.showSettingsMenu();
                            },
                            readOnly: true
                        }]);
                    });
                }

                return this;
            },
            setEmmet: function() {
                var editor = this.editor,
                    emmetOp = this._setOp(['enableEmmet']);

                if (emmetOp && emmetOp.enableEmmet) {
                    leoLoad.loadAll(['js/lib/ace/emmet.js', 'js/lib/ace/ext-emmet.js']).done(function() {
                        editor.setOptions(emmetOp);
                    });
                }

                return this;
            },
            setFullScreen: function() {
                var fullScreenOp = this._setOp(['leoSetFullScreen']);

                if (fullScreenOp && fullScreenOp.leoSetFullScreen) {
                    var dom = this.ace.require("ace/lib/dom");
                    var leoSetFullScreen = fullScreenOp.leoSetFullScreen;

                    this.editor.commands.addCommand({
                        name: "fullscreen",
                        bindKey: "F11",
                        exec: function(editor) {
                            var fullScreen = dom.toggleCssClass(document.body, "fullScreen");
                            dom.setCssClass(editor.container, "editor_fullScreen", fullScreen);
                            editor.setAutoScrollEditorIntoView(!fullScreen);
                            editor.resize();
                            leoSetFullScreen.exec && leoSetFullScreen.exec(editor, fullScreen);
                        }
                    });
                }

                return this;
            },
            setBeautifyCode: function() {
                var editor = this.editor,
                    leoBeautifyOp = this._setOp(['leoBeautify']);

                if (leoBeautifyOp && leoBeautifyOp.leoBeautify) {
                    var leoBeautify = leoBeautifyOp.leoBeautify;

                    editor.commands.addCommands([{
                        name: "beautifyCode",
                        bindKey: {
                            win: "Ctrl-Alt-f",
                            mac: "Command-f"
                        },
                        exec: function(editor) {
                            leoBeautify.exec && leoBeautify.exec(editor);
                        }
                    }]);
                }

                return this;
            },
            setSaveCode: function() {
                var editor = this.editor,
                    saveCodeOp = this._setOp(['leoSaveCode']);

                if (saveCodeOp && saveCodeOp.leoSaveCode) {
                    var leoSaveCode = saveCodeOp.leoSaveCode;

                    editor.commands.addCommands([{
                        name: "save",
                        bindKey: {
                            win: "Ctrl-s",
                            mac: "Command-s"
                        },
                        exec: function(editor) {
                            leoSaveCode.exec && leoSaveCode.exec(editor);
                        }
                    }]);
                }

                return this;
            },
            setSnippet: function() {
                var snippetOp = this._setOp(['leoSnipetArr']);

                if (snippetOp && snippetOp.leoSnipetArr && snippetOp.leoSnipetArr.length) {
                    var ace = this.ace;
                    var config = ace.config;

                    config.loadModule("ace/ext/language_tools", function() {
                        var snippetManager = ace.require("ace/snippets").snippetManager;

                        snippetOp.leoSnipetArr.forEach(function(moduleName) {
                            config.loadModule(moduleName, function(m) {
                                if (!m.snippets && m.snippetText) {
                                    m.snippets = snippetManager.parseSnippetFile(m.snippetText);
                                }

                                snippetManager.register(m.snippets || [], m.scope);
                            });
                        });
                    });
                }

                return this;
            },
            getEditor: function() {
                return this.editor;
            },

            setBlastCode: function() {
                function BlastCode(option) {
                    this.shakeTime = 0;
                    this.shakeTimeMax = 0;
                    this.shakeIntensity = 5;
                    this.lastTime = 0;
                    this.particles = [];
                    this.particlePointer = 0;
                    this.MAX_PARTICLES = 50;
                    this.PARTICLE_NUM_RANGE = {
                        min: 5,
                        max: 10
                    };
                    this.PARTICLE_GRAVITY = 0.08;
                    this.PARTICLE_ALPHA_FADEOUT = 0.96;
                    this.PARTICLE_VELOCITY_RANGE = {
                        x: [-1, 1],
                        y: [-3.5, -1.5]
                    };
                    this.winW = window.innerWidth;
                    this.winH = window.innerHeight;

                    var defaultOp = {
                            effect: 2,
                            shakeState: true,
                            blastState: true
                        },
                        op = this.option = $.extend({}, defaultOp, option);

                    this.editor = op.editor;
                    this.effect = op.effect;
                    this.editorRenderer = this.editor.renderer;
                    this.editorContainer = this.editor.container;
                    this.$editorCanvas = $(this.editorRenderer.canvas);
                    this.shakeState = op.shakeState;
                    this.blastState = op.blastState;

                    this.init();
                }

                $.extend(BlastCode.prototype, {
                    init: function() {
                        this.initCanvas();

                        var shakeChange = this.throttle(this.shake.bind(this), 100),
                            blastChange = this.throttle(this.spawnParticles.bind(this), 100);

                        this.editor.getSession().on('change', function(e) {
                            this.shakeChangeFn(shakeChange);
                            this.blastChangeFn(blastChange);
                        }.bind(this));

                        this.editor.on('focus', function(e) {
                            this.editorFocus();
                        }.bind(this));

                        this.editor.on('blur', function(e) {
                            this.editorBlur();
                        }.bind(this));

                        this.addEvent();
                    },

                    shakeChangeFn: function(shakeChange) {
                        if (this.shakeState) {
                            shakeChange(0.3);
                        }
                    },

                    blastChangeFn: function(blastChange) {
                        if (this.blastState) {
                            blastChange();
                        }
                    },

                    editorFocus: function() {
                        if (this.shakeState || this.blastState) {
                            this.startLoop();
                        }
                    },

                    editorBlur: function() {
                        if (this.shakeState || this.blastState) {
                            this.stopLoop();
                        }
                    },

                    setShakeState: function(flag) {
                        this.shakeState = !!flag;

                        if (!this.shakeState && !this.blastState) {
                            this.stopLoop();
                        }
                    },

                    setBlastState: function(flag) {
                        if (flag) {
                            this.canvas.style.display = 'block';
                            this.resize();
                            this.addEvent();

                            this.blastState = true;
                        } else {
                            this.canvas.style.display = 'none';
                            this.resizeTimer && clearTimeout(this.resizeTimer);
                            $(window).off('.leoBlastCode');

                            this.blastState = false;
                        }

                        if (!this.shakeState && !this.blastState) {
                            this.stopLoop();
                        }
                    },

                    initCanvas: function() {
                        var canvas = this.canvas = document.createElement('canvas');

                        this.ctx = canvas.getContext('2d');
                        !this.blastState && (canvas.style.display = 'none');
                        canvas.style.position = 'absolute';
                        canvas.style.top = 0;
                        canvas.style.left = 0;
                        canvas.style.zIndex = 1000;
                        canvas.style.pointerEvents = 'none';
                        canvas.width = this.winW;
                        canvas.height = this.winH;

                        document.body.appendChild(canvas);
                    },

                    resize: function() {
                        this.stopLoop();
                        this.winW = window.innerWidth;
                        this.winH = window.innerHeight;
                        this.canvas.width = this.winW;
                        this.canvas.height = this.winH;
                        this.startLoop();
                    },

                    addEvent: function() {
                        var This = this;
                        $(window).on('resize.leoBlastCode', function(event) {
                            event.preventDefault();
                            This.resizeTimer && clearTimeout(This.resizeTimer);

                            This.resizeTimer = setTimeout(function() {
                                This.resizeTimer = null;
                                This.resize();
                            }, 100);
                        });
                    },

                    getRGBComponents: function(node) {
                        var style;
                        if (node && (style = getComputedStyle(node))) {
                            try {
                                return style.color.match(/(\d+), (\d+), (\d+)/).slice(1);
                            } catch (e) {
                                return [255, 255, 255];
                            }
                        } else {
                            return [255, 255, 255];
                        }
                    },

                    spawnParticles: function() {
                        var i = 0,
                            cursors = this.editorRenderer.$cursorLayer.cursors,
                            len = cursors.length;

                        this.$editorCanvas.addClass('leoCanvas');
                        for (; i < len; i++) {
                            this.spawnParticle(cursors[i]);
                        }
                        this.$editorCanvas.removeClass('leoCanvas');
                        this.drawOver = false;
                    },

                    spawnParticle: function(cursor) {
                        var pos = cursor.getBoundingClientRect(),
                            numParticles = this.random(this.PARTICLE_NUM_RANGE.min, this.PARTICLE_NUM_RANGE.max),
                            color = this.getRGB(pos);

                        for (var i = numParticles; i--;) {
                            this.particles[this.particlePointer] = this.createParticle(pos.left + 10, pos.top, color);
                            this.particlePointer = (this.particlePointer + 1) % this.MAX_PARTICLES;
                        }
                    },

                    getRGB: function(pos) {
                        return this.getRGBComponents(document.elementFromPoint(pos.left - 5, pos.top + 5));
                    },

                    createParticle: function(x, y, color) {
                        var p = {
                                x: x,
                                y: y + 10,
                                alpha: 1,
                                color: color
                            },
                            PARTICLE_VELOCITY_RANGE = this.PARTICLE_VELOCITY_RANGE;

                        if (this.effect === 1) {
                            p.size = this.random(2, 4);
                            p.vx = PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
                                (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]);
                            p.vy = PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
                                (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]);
                        } else if (this.effect === 2) {
                            p.size = this.random(2, 8);
                            p.drag = 0.92;
                            p.vx = this.random(-3, 3);
                            p.vy = this.random(-3, 3);
                            p.wander = 0.15;
                            p.theta = this.random(0, 360) * Math.PI / 180;
                        }

                        return p;
                    },

                    effect1: function(particle) {
                        particle.vy += this.PARTICLE_GRAVITY;
                        particle.x += particle.vx;
                        particle.y += particle.vy;

                        particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;

                        this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
                        this.ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
                    },

                    effect2: function(particle) {
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vx *= particle.drag;
                        particle.vy *= particle.drag;
                        particle.theta += this.random(-0.5, 0.5);
                        particle.vx += Math.sin(particle.theta) * 0.1;
                        particle.vy += Math.cos(particle.theta) * 0.1;
                        particle.size *= 0.96;

                        this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
                        this.ctx.beginPath();
                        this.ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
                        this.ctx.fill();
                    },

                    drawParticles: function(timeDelta) {
                        var particle, particles = this.particles,
                            i = particles.length,
                            badLen = 0;

                        if (i === 0 || this.drawI > 0 || this.drawOver) {
                            return;
                        }

                        this.ctx.clearRect(0, 0, this.winW, this.winH);

                        while (i--) {
                            particle = particles[i];
                            this.drawI = i;
                            if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) {
                                badLen++;
                                continue;
                            }

                            badLen--;

                            if (this.effect === 1) {
                                this.effect1(particle);
                            } else if (this.effect === 2) {
                                this.effect2(particle);
                            }
                        }

                        if (badLen === particles.length) {
                            this.drawOver = true;
                        }
                    },

                    shake: function(time) {
                        this.shakeTime = this.shakeTimeMax = time;
                    },

                    random: function(min, max) {
                        if (!max) {
                            max = min;
                            min = 0;
                        }
                        return min + ~~(Math.random() * (max - min + 1));
                    },

                    throttle: function(callback, limit) {
                        var wait = false;
                        return function() {
                            if (!wait) {
                                callback.apply(this, arguments);
                                wait = true;
                                setTimeout(function() {
                                    wait = false;
                                }, limit);
                            }
                        };
                    },

                    loop: function() {
                        var current_time = new Date().getTime(),
                            dt;
                        if (!this.lastTime) {
                            this.last_time = current_time;
                        }
                        dt = (current_time - this.lastTime) / 1000;
                        this.lastTime = current_time;

                        if (this.shakeTime > 0) {
                            this.shakeTime -= dt;
                            var magnitude = (this.shakeTime / this.shakeTimeMax) * this.shakeIntensity;
                            var shakeX = this.random(-magnitude, magnitude);
                            var shakeY = this.random(-magnitude, magnitude);
                            this.editorContainer.style.transform = 'translate(' + shakeX + 'px,' + shakeY + 'px)';

                            this.reqContent && cancelAnimationFrame(this.reqContent);
                            this.reqContent = requestAnimationFrame(function() {
                                this.editorContainer.style.transform = '';
                            }.bind(this));
                        }

                        this.drawParticles();
                        this.reqAF = requestAnimationFrame(function() {
                            this.loop();
                        }.bind(this));
                    },

                    startLoop: function() {
                        if (!this.reqAF) {
                            this.loop();
                        }
                    },

                    stopLoop: function() {
                        this.reqAF && cancelAnimationFrame(this.reqAF);
                        this.ctx.clearRect(0, 0, this.winW, this.winH);
                        this.particles = [];
                        this.reqAF = null;
                    }
                });

                if (this.options.leoBlastCode) {
                    var leoBlastCode = $.extend({}, this.options.leoBlastCode, {
                        editor: this.editor
                    });

                    this.BlastCode = new BlastCode(leoBlastCode);
                }

                return this;
            }
        });

        return Editor;
    },

    getDialog: function() {
        function Dialog(options) {
            var defaultOp = {
                targetSelector: '#leoDialog',
                closeSelector: '.close',
                backdropClose: true,
                onAfterInit: $.noop,
                onBeforeShow: $.noop
            };

            this.options = $.extend({}, defaultOp, options);
            this.init();

            return this;
        }

        $.extend(Dialog.prototype, {
            init: function() {
                var op = this.options;

                this.$target = $(op.targetSelector);
                this.addEvent();
                op.onAfterInit.call(this);

                return this;
            },
            addEvent: function() {
                var op = this.options,
                    This = this,
                    $close = this.$target.find(op.closeSelector);

                if ($close[0]) {
                    $close.on('click', function(event) {
                        event.preventDefault();

                        This.hide();
                    });
                }

                if (op.backdropClose) {
                    this.$target.on('mousedown', function(event) {
                        if (event.target === this) {
                            This.hide();
                        }
                    });
                }

                return this;
            },
            getTarget: function() {
                return this.$target;
            },
            show: function() {
                this.options.onBeforeShow.call(this);
                this.$target.removeClass('hide').addClass('show').scrollTop(0);

                return this;
            },
            hide: function() {
                this.$target.removeClass('show').addClass('hide');

                return this;
            },
            destroy: function() {
                this.$target.remove();

                return this;
            }
        });

        return Dialog;
    },

    getButton: function() {
        function Button(options) {
            var defaultOp = {
                btnSelector: '#leoBtn',
                selectedClass: 'btn-select',
                toggle: $.noop
            };

            this.options = $.extend({}, defaultOp, options);
            this.init();

            return this;
        }

        $.extend(Button.prototype, {
            init: function() {
                var op = this.options;

                this.$target = $(op.btnSelector);
                this.setInitState().addEvent();

                return this;
            },
            setInitState: function() {
                var op = this.options;

                if (typeof op.state === 'undefined') {
                    this.state = this.$target.hasClass(op.selectedClass);
                } else {
                    this.setState(!!op.state);
                }

                return this;
            },
            addEvent: function() {
                this.$target.on('click', function(event) {
                    event.preventDefault();

                    this.toggle();
                }.bind(this));

                return this;
            },
            toggle: function(notSetClass) {
                this.state = !this.state;

                this.setState(this.state, notSetClass);
            },
            setState: function(flag, notSetClass) {
                if (flag) {
                    !notSetClass && this.$target.addClass(this.options.selectedClass);
                    this.state = true;
                    this.options.toggle(this.state);
                } else {
                    !notSetClass && this.$target.removeClass(this.options.selectedClass);
                    this.state = false;
                    this.options.toggle(this.state);
                }
            },
            fixState: function() {
                if (this.state !== this.$target.hasClass(this.options.selectedClass)) {
                    this.$target.addClass(this.options.selectedClass);

                    return true;
                }

                return false;
            },
            getState: function() {
                return this.state;
            },
            getBtn: function() {
                return this.$target;
            },
            destroy: function() {
                this.$target.remove();

                return this;
            }
        });

        return Button;
    },

    editorAll: function(leoCodeOption) {
        $(function($) {
            var $win = $(window),
                $header = $('header'),
                $editorWrapper = $('.editor_wrapper'),
                $section = $('section'),
                resizeTimer;

            function resize() {
                $editorWrapper.height($win.height() - $header.outerHeight() - parseFloat($section.css('paddingTop')) - parseFloat($section.css('paddingBottom')));
            }

            $win.on('resize', function(event) {
                event.preventDefault();

                resizeTimer && clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    resizeTimer = null;
                    resize();
                    $win.triggerHandler('winResize');
                }, 100);
            });

            resize();

            this.leoLoad.loadAll(leoCodeOption.loadUrlArr).done(function() {
                var Editor = this.getEditor(),
                    Dialog = this.getDialog(),
                    Button = this.getButton(),
                    getCodeStr = this.utils.getCodeStr,
                    EditorHtml, editorHtml,
                    EditorCss, editorCss,
                    EditorJs, editorJs,
                    runCodeBtn, runCodeTimer,
                    blastBtn, shakeBtn,
                    $previewIframe = $('#preview-iframe'),
                    $previewBtns = $('#preview-btns'),
                    $preview = $('#preview'),
                    fullScreenBtn,
                    leoDialog;

                //blastBtn
                blastBtn = new Button({
                    btnSelector: '#blast',
                    state: !!leoCodeOption.isBlast,
                    toggle: function(state) {
                        setBlastCodeState('setBlastState', state);
                    }
                });

                //shakeBtn
                shakeBtn = new Button({
                    btnSelector: '#shake',
                    state: !!leoCodeOption.isShake,
                    toggle: function(state) {
                        setBlastCodeState('setShakeState', state);
                    }
                });

                function setBlastCodeState(fn, flag) {
                    if (EditorHtml && EditorHtml.BlastCode) {
                        EditorHtml.BlastCode[fn](flag);
                    }

                    if (EditorCss && EditorCss.BlastCode) {
                        EditorCss.BlastCode[fn](flag);
                    }

                    if (EditorJs && EditorJs.BlastCode) {
                        EditorJs.BlastCode[fn](flag);
                    }
                }

                // editorHtml
                EditorHtml = new Editor(ace, {
                    id: 'editor_html',
                    mode: 'ace/mode/html',
                    leoSnipetArr: ['ace/snippets/javascript', 'ace/snippets/css'],
                    leoBeautify: {
                        exec: function(editor) {
                            var val = editor.getValue();

                            if (val) {
                                editor.setValue(html_beautify(val));
                            }
                        }
                    },
                    leoSaveCode: {
                        exec: function(editor) {
                            save();
                        }
                    },
                    leoSetFullScreen: {
                        exec: function(editor, isFullScreen) {
                            if (isFullScreen && runCodeBtn.getState()) {
                                runCodeTimer && clearTimeout(runCodeTimer);
                                runCodeBtn.setState(false, true);
                            } else if (runCodeBtn.fixState()) {
                                save();
                            }
                        }
                    },
                    leoBlastCode: {
                        shakeState: shakeBtn.getState(),
                        blastState: blastBtn.getState()
                    }
                });
                editorHtml = EditorHtml.getEditor();

                // editorCss
                EditorCss = new Editor(ace, {
                    id: 'editor_css',
                    mode: 'ace/mode/css',
                    leoBeautify: {
                        exec: function(editor) {
                            var val = editor.getValue();

                            if (val) {
                                editor.setValue(css_beautify(val));
                            }
                        }
                    },
                    leoSaveCode: {
                        exec: function(editor) {
                            save();
                        }
                    },
                    leoSetFullScreen: {
                        exec: function(editor, isFullScreen) {
                            if (isFullScreen && runCodeBtn.getState()) {
                                runCodeTimer && clearTimeout(runCodeTimer);
                                runCodeBtn.setState(false, true);
                            } else if (runCodeBtn.fixState()) {
                                save();
                            }
                        }
                    },
                    leoBlastCode: {
                        shakeState: shakeBtn.getState(),
                        blastState: blastBtn.getState()
                    }
                });
                editorCss = EditorCss.getEditor();

                // editorJs
                EditorJs = new Editor(ace, {
                    id: 'editor_js',
                    mode: 'ace/mode/javascript',
                    leoBeautify: {
                        exec: function(editor) {
                            var val = editor.getValue();

                            if (val) {
                                editor.setValue(js_beautify(val));
                            }
                        }
                    },
                    leoSaveCode: {
                        exec: function(editor) {
                            save();
                        }
                    },
                    leoSetFullScreen: {
                        exec: function(editor, isFullScreen) {
                            if (isFullScreen && runCodeBtn.getState()) {
                                runCodeTimer && clearTimeout(runCodeTimer);
                                runCodeBtn.setState(false, true);
                            } else if (runCodeBtn.fixState()) {
                                save();
                            }
                        }
                    },
                    leoBlastCode: {
                        shakeState: shakeBtn.getState(),
                        blastState: blastBtn.getState()
                    }
                });
                editorJs = EditorJs.getEditor();

                //runCodeBtn
                runCodeBtn = new Button({
                    btnSelector: '#runCode',
                    state: !!leoCodeOption.isRunCode,
                    toggle: function(state) {
                        if (state) {
                            save();
                        } else {
                            runCodeTimer && clearTimeout(runCodeTimer);
                        }
                    }
                });

                $win.on('editorChange', function(e, fn) {
                    runCodeTimer && clearTimeout(runCodeTimer);

                    runCodeTimer = setTimeout(function() {
                        save();
                        runCodeTimer = null;
                        fn && fn();
                    }, 1500);
                });

                editorHtml.getSession().on('change', function(e) {
                    if (runCodeBtn.getState()) {
                        $win.triggerHandler('editorChange');
                    }
                });

                editorCss.getSession().on('change', function(e) {
                    if (runCodeBtn.getState()) {
                        $win.triggerHandler('editorChange');
                    }
                });

                editorJs.getSession().on('change', function(e) {
                    if (runCodeBtn.getState()) {
                        $win.triggerHandler('editorChange');
                    }
                });

                //save
                function getEditorHtml() {
                    return getCodeStr({
                        html: editorHtml && editorHtml.getValue(),
                        css: editorCss && editorCss.getValue(),
                        js: editorJs && editorJs.getValue(),
                    });
                }

                function save(html) {
                    html = $.trim(html || getEditorHtml());

                    var $oldIframe = $previewIframe.find('iframe');
                    var oldIframe = $oldIframe[0];

                    if (oldIframe) {
                        $oldIframe.attr('src', 'about:blank');

                        try {
                            oldIframe.contentWindow.document.write('');
                            oldIframe.contentWindow.document.close();
                        } catch (e) {}
                    }

                    var iframe = $('<iframe frameborder="0" src="about:blank"></iframe>')[0];
                    $previewIframe.html(iframe);
                    var iframeDoc = iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();
                }

                //preview
                $preview.on('mouseenter', function(event) {
                    event.preventDefault();

                    $previewBtns.show();
                }).on('mouseleave', function(event) {
                    event.preventDefault();

                    $previewBtns.hide();
                });

                fullScreenBtn = new Button({
                    btnSelector: '#fullscreen',
                    toggle: function(state) {
                        if (state) {
                            $preview.addClass('editor_fullScreen');
                        } else {
                            $preview.removeClass('editor_fullScreen');
                        }
                    }
                });

                $('#new-preview').on('click', function(event) {
                    event.preventDefault();

                    var newDoc = window.open().document;

                    newDoc.open();
                    newDoc.write(getEditorHtml());
                    newDoc.close();
                });

                leoDialog = new Dialog({
                    targetSelector: '#leoDialog',
                    onAfterInit: function() {
                        this.$target.find('#leoDialog-btn').on('click', function(event) {
                            event.preventDefault();

                            this.hide();
                        }.bind(this));
                    }
                });

                $('#help').on('click', function(event) {
                    event.preventDefault();

                    leoDialog.show();
                });

                $win.on('winResize', function(event) {
                    editorHtml && editorHtml.resize();
                    editorCss && editorCss.resize();
                    editorJs && editorJs.resize();
                });

                function initCode(leoCodeOption) {
                    var htmlDfd = leoCodeOption.htmlDfd,
                        cssDfd = leoCodeOption.cssDfd,
                        jsDfd = leoCodeOption.jsDfd;

                    $.when(htmlDfd, cssDfd, jsDfd).done(function(html, css, js) {
                        if (html && html[0]) {
                            leoCodeOption.htmlBeautify && (html[0] = html_beautify(html[0]));
                            editorHtml.setValue(html[0]);
                        }

                        if (css && css[0]) {
                            leoCodeOption.cssBeautify && (css[0] = css_beautify(css[0]));
                            editorCss.setValue(css[0]);
                        }

                        if (js && js[0]) {
                            leoCodeOption.jsBeautify && (js[0] = js_beautify(js[0]));
                            editorJs.setValue(js[0]);
                        }

                        $win.triggerHandler('editorChange', function() {
                            fullScreenBtn.setState(leoCodeOption.isFullScreen);
                        });
                    }).fail(function(data) {
                        console.log(data);
                    }).always(function() {
                        $('#leoLoading').css({
                            'opacity': 0,
                            'visibility': 'hidden'
                        });

                        setTimeout(function(){
                            leoCodeOption.isHelpShow && $('#help').triggerHandler('click');
                        }, 3000);
                    });
                }

                initCode(leoCodeOption);
            }.bind(this));
        }.bind(this));
    },

    init: function() {
        var op = this.getLeoCodeOption();

        this[op.mode] && this[op.mode](op);
    }
};

leoCode.init();
