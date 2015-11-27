$(function() {
    var $win = $(window);
    var $header = $('header');
    var $editorWrapper = $('.editor_wrapper');
    var $section = $('section');
    var resizeTimer;

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

    var leoLoad = {
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
    };

    leoLoad.load('js/lib/ace/ace.js').done(function() {
        // editorHtml
        var editorHtml = new Editor(ace, {
            id: 'editor_html',
            mode: 'ace/mode/html',
            leoSnipetArr: ['ace/snippets/javascript', 'ace/snippets/css']
        }).getEditor();

        leoLoad.load('js/lib/js-beautify/beautify-html.js').done(function() {
            editorHtml.commands.addCommands([{
                name: "beautify",
                bindKey: {
                    win: "Ctrl-Alt-f",
                    mac: "Command-f"
                },
                exec: function(editor) {
                    editor.setValue(html_beautify(editor.getValue()));
                }
            }]);
        }.bind(this));

        editorHtml.commands.addCommands([{
            name: "save",
            bindKey: {
                win: "Ctrl-s",
                mac: "Command-s"
            },
            exec: function(editor) {
                save();
            }
        }]);

        // editorCss
        var editorCss = new Editor(ace, {
            id: 'editor_css',
            mode: 'ace/mode/css'
        }).getEditor();

        leoLoad.load('js/lib/js-beautify/beautify-css.js').done(function() {
            editorCss.commands.addCommands([{
                name: "beautify",
                bindKey: {
                    win: "Ctrl-Alt-f",
                    mac: "Command-f"
                },
                exec: function(editor) {
                    editor.setValue(css_beautify(editor.getValue()));
                }
            }]);
        }.bind(this));

        editorCss.commands.addCommands([{
            name: "save",
            bindKey: {
                win: "Ctrl-s",
                mac: "Command-s"
            },
            exec: function(editor) {
                save();
            }
        }]);

        // editorJs
        var editorJs = new Editor(ace, {
            id: 'editor_js',
            mode: 'ace/mode/javascript'
        }).getEditor();

        leoLoad.load('js/lib/js-beautify/beautify.js').done(function() {
            editorJs.commands.addCommands([{
                name: "beautify",
                bindKey: {
                    win: "Ctrl-Alt-f",
                    mac: "Command-f"
                },
                exec: function(editor) {
                    editor.setValue(js_beautify(editor.getValue()));
                }
            }]);
        }.bind(this));

        editorJs.commands.addCommands([{
            name: "save",
            bindKey: {
                win: "Ctrl-s",
                mac: "Command-s"
            },
            exec: function(editor) {
                save();
            }
        }]);

        function getEditorHtml() {
            var html = '';

            if (editorHtml) {
                html = $.trim(editorHtml.getValue());

                if (editorJs) {
                    index = html.indexOf('</body>');
                    value = $.trim(editorJs.getValue());
                    if (value && index > -1) {
                        html = html.slice(0, index) + '<script>try{' + editorJs.getValue() + '}catch(e){}</script>' + html.slice(index);
                    }
                }

                if (editorCss) {
                    index = html.indexOf('</body>');
                    value = $.trim(editorCss.getValue());
                    if (value && index > -1) {
                        html = html.slice(0, index) + '<style>' + editorCss.getValue() + '</style>' + html.slice(index)
                    }
                }
            }

            return html;
        }

        var $previewIframe = $('#preview-iframe');

        function save(html) {
            html = $.trim(html || getEditorHtml());

            var iframe = $('<iframe frameborder="0"></iframe>')[0];
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

            var html = $.trim(getEditorHtml());
            var newWindow = window.open("about:blank", "top=0, left=0");
            var newDoc = newWindow.document;

                newDoc.open();
                newDoc.write(html);
                newDoc.close();
        });

        var $leoDialog = $('#leoDialog');

        $('#help').on('click', function(event) {
            event.preventDefault();

            $leoDialog.show()
        });

        $('#leoDialog-btn').on('click', function(event) {
            event.preventDefault();

            $leoDialog.hide();
        });

        $win.on('winResize', function(event) {
            editorHtml && editorHtml.resize();
            editorCss && editorCss.resize();
            editorJs && editorJs.resize();
        });
    });

    function Editor(ace, op) {
        var defaultOp = {
            mode: 'ace/mode/html',
            theme: 'ace/theme/monokai',
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableEmmet: false,
            fontSize: '16px',
            printMargin: false,
            leoSetFullScreen: true,
            leoSetShowSettingsMenu: true
        }

        if (!ace) {
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

            delete op.id;
            this.setLanguageTools().setEmmet().setSnippet().setFullScreen().setShowSettingsMenu();
            editor.setOptions(op);
            editor.getSession().setUseWrapMode(true);

            return this;
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
                leoLoad.load("js/lib/ace/ext-language_tools.js", function() {
                    editor.setOptions(languageToolsOp);
                }.bind(this));
            }

            return this;
        },
        setShowSettingsMenu: function() {
            var editor = this.editor,
                showSettingsMenuOp = this._setOp(['leoSetShowSettingsMenu']);

            if (showSettingsMenuOp && showSettingsMenuOp.leoSetShowSettingsMenu) {
                leoLoad.load("js/lib/ace/ext-settings_menu.js", function() {
                    this.ace.require('ace/ext/settings_menu').init(editor);
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
                }.bind(this));
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
        setSnippet: function() {
            var snippetOp = this._setOp(['leoSnipetArr']);

            if (snippetOp && snippetOp.leoSnipetArr && snippetOp.leoSnipetArr.length) {
                leoLoad.load("js/lib/ace/ext-language_tools.js", function() {
                    var ace = this.ace;
                    var snippetManager = ace.require("ace/snippets").snippetManager;
                    var config = ace.config;

                    snippetOp.leoSnipetArr.forEach(function(moduleName) {
                        leoLoad.load(config.moduleUrl(moduleName), function() {
                            var m = ace.require(moduleName);

                            if (!m.snippets && m.snippetText) {
                                m.snippets = snippetManager.parseSnippetFile(m.snippetText);
                            }

                            snippetManager.register(m.snippets || [], m.scope);
                        });
                    });
                }.bind(this));
            }

            return this;
        },
        getEditor: function() {
            return this.editor;
        }
    });
})
