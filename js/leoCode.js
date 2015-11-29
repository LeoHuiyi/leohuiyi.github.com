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
            var leoCodeStr = $.trim(decodeURIComponent(document.location.search.replace(/\?leoCode=/, ''))),
                obj = {};

            try {
                obj = $.parseJSON(leoCodeStr);
            } catch (e) {
                return {};
            }

            return obj;
        },

        htmlEncode: function(str) {
            return $('<div/>').text(str).html()
        },

        htmlDecode: function(str) {
            return $('<div/>').html(str).text();
        },

        getCodeStr: function(op) {
            var option = $.extend({}, op),
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
        },

        setUrlObj: function(op) {
            var base = document.location.href.replace(/.html.+/, '.html'),
                option = $.extend({
                    html: '',
                    js: '',
                    css: ''
                }, op),
                htmlEncode = leoCode.utils.htmlEncode;

            if (option.html) {
                option.html = htmlEncode(option.html);
            }

            return base + '?leoCode=' + encodeURIComponent(JSON.stringify(option));
        }
    },

    getLeoCodeOption: function() {
        var utils = this.utils,
            op = utils.getUrlObj(),
            option = $.extend({
                mode: 'editorAll', //editorAll, preview
                loadUrlArr: ['js/lib/ace/ace.js']
            }, op);

        option.html && (option.html = utils.htmlDecode(option.html));

        if (option.mode === 'preview') {
            option.iframeHtml = utils.getCodeStr(option);
        }

        if (option.mode === 'editorAll') {
            option.loadUrlArr.push('js/lib/js-beautify/beautify-html.js', 'js/lib/js-beautify/beautify-css.js', 'js/lib/js-beautify/beautify.js')
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
            }

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

                this.setLanguageTools().setEmmet().setSnippet().setFullScreen().setShowSettingsMenu().setBeautifyCode().setSaveCode();
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
                        if (typeof op[prop] !== 'undefind') {
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

                    this.editor.commands.addCommand({
                        name: "fullscreen",
                        bindKey: "F11",
                        exec: function(editor) {
                            var fullScreen = dom.toggleCssClass(document.body, "fullScreen");
                            dom.setCssClass(editor.container, "editor_fullScreen", fullScreen)
                            editor.setAutoScrollEditorIntoView(!fullScreen);
                            editor.resize();
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
            }

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
                    This = this;

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

    editorAll: function(LeoCodeOption) {
        $(function() {
            var $win = $(window),
                $header = $('header'),
                $editorWrapper = $('.editor_wrapper'),
                $section = $('section'),
                resizeTimer,
                leoLoad = this.leoLoad;

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

            leoLoad.loadAll(LeoCodeOption.loadUrlArr).done(function() {
                var Editor = this.getEditor(),
                    Dialog = this.getDialog(),
                    setUrlObj = this.utils.setUrlObj,
                    getCodeStr = this.utils.getCodeStr;
                // editorHtml
                var editorHtml = new Editor(ace, {
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
                    }
                }).getEditor();

                // editorCss
                var editorCss = new Editor(ace, {
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
                    }
                }).getEditor();

                // editorJs
                var editorJs = new Editor(ace, {
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
                    }
                }).getEditor();

                function getEditorHtml() {
                    return getCodeStr({
                        html: editorHtml && editorHtml.getValue(),
                        css: editorCss && editorCss.getValue(),
                        js: editorJs && editorJs.getValue(),
                    })
                }

                var $previewIframe = $('#preview-iframe');

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

                var $previewBtns = $('#preview-btns');
                var $preview = $('#preview');
                var isFullScreen = false;

                $preview.on('mouseenter', function(event) {
                    event.preventDefault();

                    $previewBtns.show();
                }).on('mouseleave', function(event) {
                    event.preventDefault();

                    $previewBtns.hide();
                });

                $('#fullscreen').on('click', function(event) {
                    event.preventDefault();

                    if (!isFullScreen) {
                        $preview.addClass('editor_fullScreen');
                        isFullScreen = true;
                    } else {
                        $preview.removeClass('editor_fullScreen');
                        isFullScreen = false;
                    }
                });

                $('#new-preview').on('click', function(event) {
                    event.preventDefault();

                    var url = setUrlObj({
                        html: editorHtml && editorHtml.getValue(),
                        css: editorCss && editorCss.getValue(),
                        js: editorJs && editorJs.getValue(),
                        mode: 'preview'
                    });
                    var newWindow = window.open(url);
                });

                var leoDialog = new Dialog({
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

                    leoDialog.show()
                });

                var leoShare = new Dialog({
                    targetSelector: '#leoShare',
                    onBeforeShow: function() {
                        $('#leoShareUrl').text(setUrlObj({
                            html: editorHtml && editorHtml.getValue(),
                            css: editorCss && editorCss.getValue(),
                            js: editorJs && editorJs.getValue()
                        }));
                    }
                });

                $('#share').on('click', function(event) {
                    event.preventDefault();

                    leoShare.show()
                });

                $win.on('winResize', function(event) {
                    editorHtml && editorHtml.resize();
                    editorCss && editorCss.resize();
                    editorJs && editorJs.resize();
                });

                function initCode(LeoCodeOption) {
                    var html = LeoCodeOption.html,
                        css = LeoCodeOption.css,
                        js = LeoCodeOption.js,
                        changeTimer,
                        $runCode = $('#runCode'),
                        isRunCode = true;

                    if (html) {
                        LeoCodeOption.htmlBeautify && (html = html_beautify(html));
                        editorHtml.setValue(html);
                    }

                    if (css) {
                        LeoCodeOption.cssBeautify && (css = css_beautify(css));
                        editorCss.setValue(css);
                    }

                    if (js) {
                        LeoCodeOption.jsBeautify && (js = js_beautify(js));
                        editorJs.setValue(js);
                    }

                    save();

                    $win.on('editorChange', function() {
                        changeTimer && clearTimeout(changeTimer);

                        changeTimer = setTimeout(function() {
                            save();
                            changeTimer = null;
                        }, 1000);
                    });

                    editorHtml.getSession().on('change', function(e) {
                        isRunCode && $win.triggerHandler('editorChange');
                    });

                    editorCss.getSession().on('change', function(e) {
                        isRunCode && $win.triggerHandler('editorChange');
                    });

                    editorJs.getSession().on('change', function(e) {
                        isRunCode && $win.triggerHandler('editorChange');
                    });

                    $runCode.on('click', function(event) {
                        event.preventDefault();

                        if (isRunCode) {
                            changeTimer && clearTimeout(changeTimer);
                            $runCode.addClass('btn-disabled');
                            isRunCode = false;
                        } else {
                            save();
                            $runCode.removeClass('btn-disabled');
                            isRunCode = true;
                        }
                    });

                    $('#leoLoading').css({
                        'opacity': 0,
                        'visibility': 'hidden'
                    });
                }

                initCode(LeoCodeOption);
            }.bind(this));
        }.bind(this));
    },

    preview: function(LeoCodeOption) {
        $(function() {
            var iframe = $('<iframe frameborder="0" src="about:blank" class="iframe_fullScreen"></iframe>')[0];
            $('body').html(iframe);
            var iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(LeoCodeOption.iframeHtml);
            iframeDoc.close();
        });
    },

    init: function() {
        var op = this.getLeoCodeOption();

        this[op.mode] && this[op.mode](op)
    }
};

leoCode.init();
