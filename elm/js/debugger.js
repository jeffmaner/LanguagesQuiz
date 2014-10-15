Elm.Native.Slider = {};
Elm.Native.Slider.make = function(elm) {

    elm.Native = elm.Native || {};
    elm.Native.Slider = elm.Native.Slider || {};
    if (elm.Native.Slider.values) return elm.Native.Slider.values;

    var newNode = ElmRuntime.use(ElmRuntime.Render.Utils).newElement;
    var newElement = Elm.Graphics.Element.make(elm).newElement;

    function renderSlider(model) {
        var node = newNode('input');
        node.type = 'range';

        node.min = model.styling.min;
        node.max = model.styling.max;
        node.step = model.styling.step;
        node.value = model.styling.value;

        if (!model.styling.horizontal) {
            node.orient = "vertical"; // FF
            node.style.webkitAppearance = "slider-vertical"; // webkit
            node.style.writingMode = "bt-lr"; // ie
        }

        if (model.styling.disabled) {
            node.disabled = true;
        }

        node.style.display = 'block';
        node.style.pointerEvents = 'auto';
        node.elm_signal = model.signal;
        node.elm_handler = model.handler;
        node.addEventListener('input', notifySlider);
        node.addEventListener('change', notifySlider);
        function notifySlider() {
            elm.notify(node.elm_signal.id, node.elm_handler(node.value));
        }
        return node;
    }

    function updateSlider(node, oldModel, newModel) {
        if (newModel.styling.disabled) {
            node.disabled = true;
        } else {
            node.disabled = false;
        }
        node.elm_signal = newModel.signal;
        node.elm_handler = newModel.handler;
        node.min = newModel.styling.min;
        node.max = newModel.styling.max;
        node.step = newModel.styling.step;
        node.value = newModel.styling.value;
    }

    function slider(signal, handler, styling) {
        var width = styling.length;
        var height = 24;
        if (!styling.horizontal) {
            var temp = width;
            width = height;
            height = temp;
        }
        return A3(newElement, width, height, {
            ctor: 'Custom',
            type: 'Slider',
            render: renderSlider,
            update: updateSlider,
            model: { signal:signal, handler:handler, styling:styling }
        });
    }

    return elm.Native.Slider.values = {
        slider:F3(slider)
    };
}
Elm.DebuggerInterface = Elm.DebuggerInterface || {};
Elm.DebuggerInterface.make = function (_elm) {
   "use strict";
   _elm.DebuggerInterface = _elm.DebuggerInterface || {};
   if (_elm.DebuggerInterface.values)
   return _elm.DebuggerInterface.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "DebuggerInterface",
   $Basics = Elm.Basics.make(_elm),
   $Color = Elm.Color.make(_elm),
   $Graphics$Collage = Elm.Graphics.Collage.make(_elm),
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Graphics$Input = Elm.Graphics.Input.make(_elm),
   $List = Elm.List.make(_elm),
   $Maybe = Elm.Maybe.make(_elm),
   $Native$Json = Elm.Native.Json.make(_elm),
   $Native$Ports = Elm.Native.Ports.make(_elm),
   $Signal = Elm.Signal.make(_elm),
   $Slider = Elm.Slider.make(_elm),
   $String = Elm.String.make(_elm),
   $Text = Elm.Text.make(_elm),
   $Window = Elm.Window.make(_elm);
   var noWatches = $Text.markdown("<div style=\"height:0;width:0;\">&nbsp;</div><h3><span style=\"font-family: Gotham, Futura, \'Lucida Grande\', sans-serif; font-size: 12pt; color: rgb(170,170,170)\"> You don&#39;t have any watches! </span></h3>\n<p><span style=\"color: rgb(170,170,170)\">\n<span style=\"font-family: Gotham, Futura, \'Lucida Grande\', sans-serif; font-size: 10pt; color: rgb(170,170,170)\">\nUse <a href=\"http://library.elm-lang.org/catalog/elm-lang-Elm/latest/Debug#watch\"><span style=\"text-decoration:underline; color: rgb(170,170,170)\">Debug.watch</span></a>\nto show any value. <br>\n<code>watch : String -&gt; a -&gt; a</code></span></p>\n<p><span style=\"font-family: Gotham, Futura, \'Lucida Grande\', sans-serif; font-size: 10pt; color: rgb(170,170,170)\">\nUse <a href=\"http://library.elm-lang.org/catalog/elm-lang-Elm/latest/Debug#watchSummary\"><span style=\"text-decoration:underline; color: rgb(170,170,170)\">Debug.watchSummary</span></a> to show a <br>\nsummary or subvalue of any value. </span><br></p>\n<div style=\"height:0;width:0;\">&nbsp;</div>",
   "320:13");
   var roundedSquare = F3(function (side,
   radius,
   toForm) {
      return function () {
         var formedCircle = toForm($Graphics$Collage.circle(radius));
         var shortSide = side - 2 * radius;
         var xRect = toForm(A2($Graphics$Collage.rect,
         side,
         shortSide));
         var yRect = toForm(A2($Graphics$Collage.rect,
         shortSide,
         side));
         var circleOffset = shortSide / 2;
         var tl = $Graphics$Collage.move({ctor: "_Tuple2"
                                         ,_0: 0 - circleOffset
                                         ,_1: circleOffset})(formedCircle);
         var tr = $Graphics$Collage.move({ctor: "_Tuple2"
                                         ,_0: circleOffset
                                         ,_1: circleOffset})(formedCircle);
         var bl = $Graphics$Collage.move({ctor: "_Tuple2"
                                         ,_0: 0 - circleOffset
                                         ,_1: 0 - circleOffset})(formedCircle);
         var br = $Graphics$Collage.move({ctor: "_Tuple2"
                                         ,_0: circleOffset
                                         ,_1: 0 - circleOffset})(formedCircle);
         return $Graphics$Collage.group(_L.fromArray([xRect
                                                     ,yRect
                                                     ,tl
                                                     ,tr
                                                     ,bl
                                                     ,br]));
      }();
   });
   var startState = {_: {}
                    ,paused: false
                    ,scrubPosition: 0
                    ,totalEvents: 0};
   var step = F2(function (update,
   state) {
      return function () {
         switch (update.ctor)
         {case "Pause":
            return _U.replace([["paused"
                               ,update._0]
                              ,["totalEvents"
                               ,update._0 ? state.totalEvents : state.scrubPosition]],
              state);
            case "Restart":
            return startState;
            case "ScrubPosition":
            return _U.replace([["scrubPosition"
                               ,update._0]
                              ,["paused",true]],
              state);
            case "TotalEvents":
            return _U.replace([["totalEvents"
                               ,update._0]
                              ,["scrubPosition",update._0]],
              state);}
         _E.Case($moduleName,
         "between lines 265 and 286");
      }();
   });
   var showSwap = $Native$Ports.portIn("showSwap",
   function (v) {
      return typeof v === "boolean" ? v : _E.raise("invalid input, expecting JSBoolean but got " + v);
   });
   var watches = $Native$Ports.portIn("watches",
   $Native$Ports.incomingSignal(function (v) {
      return _U.isJSArray(v) ? _L.fromArray(v.map(function (v) {
         return _U.isJSArray(v) ? {ctor: "_Tuple2"
                                  ,_0: typeof v[0] === "string" || typeof v[0] === "object" && v[0] instanceof String ? v[0] : _E.raise("invalid input, expecting JSString but got " + v[0])
                                  ,_1: typeof v[1] === "string" || typeof v[1] === "object" && v[1] instanceof String ? v[1] : _E.raise("invalid input, expecting JSString but got " + v[1])} : _E.raise("invalid input, expecting JSArray but got " + v);
      })) : _E.raise("invalid input, expecting JSArray but got " + v);
   }));
   var eventCounter = $Native$Ports.portIn("eventCounter",
   $Native$Ports.incomingSignal(function (v) {
      return typeof v === "number" ? v : _E.raise("invalid input, expecting JSNumber but got " + v);
   }));
   var scrubInput = $Graphics$Input.input(0);
   var restartInput = $Graphics$Input.input({ctor: "_Tuple0"});
   var permitSwapInput = $Graphics$Input.input(true);
   var pausedInput = $Graphics$Input.input(false);
   var permitSwap = $Native$Ports.portOut("permitSwap",
   $Native$Ports.outgoingSignal(function (v) {
      return v;
   }),
   permitSwapInput.signal);
   var restart = $Native$Ports.portOut("restart",
   $Native$Ports.outgoingSignal(function (v) {
      return v;
   }),
   A2($Signal.lift,
   function (x) {
      return 0;
   },
   restartInput.signal));
   var scrubSlider = F2(function (_v4,
   state) {
      return function () {
         switch (_v4.ctor)
         {case "_Tuple2":
            return function () {
                 var sliderLength = _v4._0;
                 var sliderStyle = _U.replace([["length"
                                               ,sliderLength]
                                              ,["max"
                                               ,$Basics.toFloat(state.totalEvents)]
                                              ,["value"
                                               ,$Basics.toFloat(state.scrubPosition)]],
                 $Slider.defaultSlider);
                 return A3($Graphics$Element.container,
                 sliderLength,
                 20,
                 $Graphics$Element.middle)(A3($Slider.slider,
                 scrubInput.handle,
                 $Basics.round,
                 sliderStyle));
              }();}
         _E.Case($moduleName,
         "between lines 115 and 123");
      }();
   });
   var myButton = F3(function (handle,
   value,
   name) {
      return function () {
         var img = function (state) {
            return A3($Graphics$Element.image,
            40,
            40,
            _L.append("/_reactor/debugger/",
            _L.append(name,
            _L.append("-button-",
            _L.append(state,".png")))));
         };
         return A5($Graphics$Input.customButton,
         handle,
         value,
         img("up"),
         img("hover"),
         img("down"));
      }();
   });
   var playButton = A3(myButton,
   pausedInput.handle,
   false,
   "play");
   var pauseButton = A3(myButton,
   pausedInput.handle,
   true,
   "pause");
   var restartButton = A3(myButton,
   restartInput.handle,
   {ctor: "_Tuple0"},
   "restart");
   var darkGrey = A3($Color.rgb,
   74,
   74,
   74);
   var lightGrey = A3($Color.rgb,
   228,
   228,
   228);
   var dataStyle = F3(function (typefaces,
   height,
   string) {
      return function () {
         var myStyle = _U.replace([["typeface"
                                   ,typefaces]
                                  ,["color",lightGrey]
                                  ,["height"
                                   ,$Maybe.Just(height)]],
         $Text.defaultStyle);
         return A2($Text.style,
         myStyle,
         $Text.toText(string));
      }();
   });
   var textStyle = A2(dataStyle,
   _L.fromArray(["Gotham"
                ,"Futura"
                ,"Lucida Grande"
                ,"sans-serif"]),
   12);
   var watchStyle = A2(dataStyle,
   _L.fromArray(["Gotham"
                ,"Futura"
                ,"Lucida Grande"
                ,"sans-serif"]),
   14);
   var codeStyle = A2(dataStyle,
   _L.fromArray(["Menlo for Powerline"
                ,"monospace"]),
   12);
   var blue = A3($Color.rgb,
   28,
   129,
   218);
   var swapButton = function (permitSwap) {
      return function () {
         var info = $Text.leftAligned(textStyle("swap"));
         var radius = 4;
         var hsWidth = 25;
         var bgButton = A3(roundedSquare,
         hsWidth,
         radius,
         $Graphics$Collage.filled(lightGrey));
         var trueButton = _L.fromArray([bgButton
                                       ,A3(roundedSquare,
                                       22,
                                       radius,
                                       $Graphics$Collage.filled(blue))]);
         var falseButtonClick = trueButton;
         var trueButtonHover = _L.fromArray([bgButton
                                            ,A3(roundedSquare,
                                            22,
                                            radius,
                                            $Graphics$Collage.filled(blue))
                                            ,$Graphics$Collage.alpha(0.1)(A3(roundedSquare,
                                            22,
                                            radius,
                                            $Graphics$Collage.filled(darkGrey)))]);
         var falseButton = _L.fromArray([bgButton
                                        ,A3(roundedSquare,
                                        22,
                                        radius,
                                        $Graphics$Collage.filled(darkGrey))]);
         var trueButtonClick = falseButton;
         var falseButtonHover = _L.fromArray([bgButton
                                             ,A3(roundedSquare,
                                             22,
                                             radius,
                                             $Graphics$Collage.filled(darkGrey))
                                             ,$Graphics$Collage.alpha(0.1)(A3(roundedSquare,
                                             22,
                                             radius,
                                             $Graphics$Collage.filled(blue)))]);
         var button = permitSwap ? A5($Graphics$Input.customButton,
         permitSwapInput.handle,
         false,
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         trueButton),
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         trueButtonHover),
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         trueButtonClick)) : A5($Graphics$Input.customButton,
         permitSwapInput.handle,
         true,
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         falseButton),
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         falseButtonHover),
         A3($Graphics$Collage.collage,
         hsWidth,
         hsWidth,
         falseButtonClick));
         return A2($Graphics$Element.flow,
         $Graphics$Element.right,
         _L.fromArray([info
                      ,A2($Graphics$Element.spacer,
                      10,
                      1)
                      ,button]));
      }();
   };
   var panelWidth = 275;
   var textHeight = 20;
   var sliderMinMaxText = F2(function (w,
   state) {
      return function () {
         var sliderTotalEvents = A3($Graphics$Element.container,
         w,
         textHeight,
         $Graphics$Element.topRight)($Text.rightAligned(textStyle($String.show(state.totalEvents))));
         var sliderStartText = A3($Graphics$Element.container,
         w,
         textHeight,
         $Graphics$Element.topLeft)($Text.leftAligned(textStyle("0")));
         return A2($Graphics$Element.flow,
         $Graphics$Element.outward,
         _L.fromArray([sliderStartText
                      ,sliderTotalEvents]));
      }();
   });
   var sideMargin = 2 * 20;
   var sliderEventText = F2(function (w,
   state) {
      return function () {
         var text$ = $Text.centered(textStyle($String.show(state.scrubPosition)));
         var yPos = $Graphics$Element.absolute($Basics.round(textHeight / 2));
         var totalEvents = $Basics.toFloat(state.totalEvents);
         var scrubPosition = $Basics.toFloat(state.scrubPosition);
         var textWidthOffset = 14;
         var midWidth = $Basics.toFloat(w) - sideMargin - textWidthOffset;
         var leftDistance = _U.eq(totalEvents,
         0) ? sideMargin / 2 + textWidthOffset / 2 : scrubPosition / totalEvents * midWidth + sideMargin / 2 + textWidthOffset / 2;
         var xPos = $Graphics$Element.absolute($Basics.round(leftDistance));
         var textPosition = A2($Graphics$Element.middleAt,
         xPos,
         yPos);
         return A4($Graphics$Element.container,
         w,
         textHeight,
         textPosition,
         text$);
      }();
   });
   var buttonWidth = 40;
   var buttonHeight = 40;
   var view = F4(function (_v8,
   watches,
   permitSwap,
   state) {
      return function () {
         switch (_v8.ctor)
         {case "_Tuple2":
            return function () {
                 var showWatch = function (_v12) {
                    return function () {
                       switch (_v12.ctor)
                       {case "_Tuple2":
                          return A2($Graphics$Element.flow,
                            $Graphics$Element.down,
                            _L.fromArray([$Graphics$Element.width(_v8._0)($Text.leftAligned($Text.bold(watchStyle(_v12._0))))
                                         ,$Graphics$Element.width(_v8._0)($Text.leftAligned(codeStyle(_v12._1)))
                                         ,A2($Graphics$Element.spacer,
                                         1,
                                         12)]));}
                       _E.Case($moduleName,
                       "between lines 195 and 199");
                    }();
                 };
                 var watchView = A2($Graphics$Element.flow,
                 $Graphics$Element.right,
                 _L.fromArray([A2($Graphics$Element.spacer,
                              20,
                              1)
                              ,function () {
                                 switch (watches.ctor)
                                 {case "[]": return noWatches;}
                                 return $Graphics$Element.flow($Graphics$Element.down)(A2($List.map,
                                 showWatch,
                                 watches));
                              }()]));
                 var bar = A2($Graphics$Element.flow,
                 $Graphics$Element.down,
                 _L.fromArray([$Graphics$Element.opacity(0.3)($Graphics$Element.color(lightGrey)(A2($Graphics$Element.spacer,
                              _v8._0,
                              1)))
                              ,A2($Graphics$Element.spacer,
                              _v8._0,
                              12)]));
                 var fittedSwapButton = showSwap ? A3($Graphics$Element.container,
                 _v8._0 - 2 * buttonWidth - sideMargin,
                 buttonHeight,
                 $Graphics$Element.middle)(swapButton(permitSwap)) : A2($Graphics$Element.spacer,
                 2 * buttonWidth,
                 1);
                 var buttons = A2($Graphics$Element.flow,
                 $Graphics$Element.right,
                 _L.fromArray([restartButton
                              ,fittedSwapButton
                              ,state.paused ? playButton : pauseButton]));
                 var buttonContainer = A4($Graphics$Element.container,
                 _v8._0,
                 buttonHeight,
                 $Graphics$Element.midTop,
                 buttons);
                 var buttonSliderSpaceHeight = 10;
                 var topSpacerHeight = 15;
                 var midWidth = _v8._0 - sideMargin;
                 var centeredSliderContainer = A3($Graphics$Element.container,
                 _v8._0,
                 24 + textHeight,
                 $Graphics$Element.midTop)(A2($Graphics$Element.flow,
                 $Graphics$Element.down,
                 _L.fromArray([A2(scrubSlider,
                              {ctor: "_Tuple2"
                              ,_0: midWidth
                              ,_1: _v8._1},
                              state)
                              ,A2(sliderMinMaxText,
                              midWidth,
                              state)])));
                 var slider = A3($Graphics$Element.container,
                 _v8._0,
                 24 + 2 * textHeight,
                 $Graphics$Element.midTop)(A2($Graphics$Element.flow,
                 $Graphics$Element.down,
                 _L.fromArray([A2(sliderEventText,
                              _v8._0,
                              state)
                              ,centeredSliderContainer])));
                 var controls = A2($Graphics$Element.flow,
                 $Graphics$Element.down,
                 _L.fromArray([A2($Graphics$Element.spacer,
                              midWidth,
                              topSpacerHeight)
                              ,buttonContainer
                              ,A2($Graphics$Element.spacer,
                              midWidth,
                              buttonSliderSpaceHeight)
                              ,slider
                              ,A2($Graphics$Element.spacer,
                              midWidth,
                              10)]));
                 return A2($Graphics$Element.flow,
                 $Graphics$Element.down,
                 _L.fromArray([controls
                              ,bar
                              ,watchView]));
              }();}
         _E.Case($moduleName,
         "between lines 160 and 210");
      }();
   });
   var State = F3(function (a,
   b,
   c) {
      return {_: {}
             ,paused: a
             ,scrubPosition: c
             ,totalEvents: b};
   });
   var ScrubPosition = function (a) {
      return {ctor: "ScrubPosition"
             ,_0: a};
   };
   var TotalEvents = function (a) {
      return {ctor: "TotalEvents"
             ,_0: a};
   };
   var Pause = function (a) {
      return {ctor: "Pause",_0: a};
   };
   var Restart = {ctor: "Restart"};
   var aggregateUpdates = $Signal.merges(_L.fromArray([A2($Signal._op["<~"],
                                                      $Basics.always(Restart),
                                                      restartInput.signal)
                                                      ,A2($Signal._op["<~"],
                                                      Pause,
                                                      pausedInput.signal)
                                                      ,A2($Signal._op["<~"],
                                                      TotalEvents,
                                                      eventCounter)
                                                      ,A2($Signal._op["<~"],
                                                      ScrubPosition,
                                                      scrubInput.signal)]));
   var scene = A3($Signal.foldp,
   step,
   startState,
   aggregateUpdates);
   var main = A2($Signal._op["~"],
   A2($Signal._op["~"],
   A2($Signal._op["~"],
   A2($Signal._op["<~"],
   view,
   A2($Signal._op["<~"],
   function (_v17) {
      return function () {
         switch (_v17.ctor)
         {case "_Tuple2":
            return {ctor: "_Tuple2"
                   ,_0: panelWidth
                   ,_1: _v17._1};}
         _E.Case($moduleName,
         "on line 218, column 30 to 43");
      }();
   },
   $Window.dimensions)),
   watches),
   permitSwapInput.signal),
   scene);
   var scrubTo = $Native$Ports.portOut("scrubTo",
   $Native$Ports.outgoingSignal(function (v) {
      return v;
   }),
   A2($Signal._op["<~"],
   function (_) {
      return _.scrubPosition;
   },
   scene));
   var pause = $Native$Ports.portOut("pause",
   $Native$Ports.outgoingSignal(function (v) {
      return v;
   }),
   A2($Signal._op["<~"],
   function (_) {
      return _.paused;
   },
   scene));
   _elm.DebuggerInterface.values = {_op: _op
                                   ,Restart: Restart
                                   ,Pause: Pause
                                   ,TotalEvents: TotalEvents
                                   ,ScrubPosition: ScrubPosition
                                   ,State: State
                                   ,buttonHeight: buttonHeight
                                   ,buttonWidth: buttonWidth
                                   ,sideMargin: sideMargin
                                   ,textHeight: textHeight
                                   ,panelWidth: panelWidth
                                   ,blue: blue
                                   ,lightGrey: lightGrey
                                   ,darkGrey: darkGrey
                                   ,dataStyle: dataStyle
                                   ,textStyle: textStyle
                                   ,watchStyle: watchStyle
                                   ,codeStyle: codeStyle
                                   ,myButton: myButton
                                   ,playButton: playButton
                                   ,pauseButton: pauseButton
                                   ,restartButton: restartButton
                                   ,swapButton: swapButton
                                   ,scrubSlider: scrubSlider
                                   ,sliderEventText: sliderEventText
                                   ,sliderMinMaxText: sliderMinMaxText
                                   ,view: view
                                   ,main: main
                                   ,pausedInput: pausedInput
                                   ,permitSwapInput: permitSwapInput
                                   ,restartInput: restartInput
                                   ,scrubInput: scrubInput
                                   ,scene: scene
                                   ,startState: startState
                                   ,step: step
                                   ,aggregateUpdates: aggregateUpdates
                                   ,roundedSquare: roundedSquare
                                   ,noWatches: noWatches};
   return _elm.DebuggerInterface.values;
};Elm.Slider = Elm.Slider || {};
Elm.Slider.make = function (_elm) {
   "use strict";
   _elm.Slider = _elm.Slider || {};
   if (_elm.Slider.values)
   return _elm.Slider.values;
   var _op = {},
   _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Slider",
   $Graphics$Element = Elm.Graphics.Element.make(_elm),
   $Graphics$Input = Elm.Graphics.Input.make(_elm),
   $Native$Slider = Elm.Native.Slider.make(_elm);
   var slider = $Native$Slider.slider;
   var defaultSlider = {_: {}
                       ,disabled: false
                       ,horizontal: true
                       ,length: 100
                       ,max: 100
                       ,min: 0
                       ,step: 1
                       ,value: 0};
   var SliderStyle = F7(function (a,
   b,
   c,
   d,
   e,
   f,
   g) {
      return {_: {}
             ,disabled: b
             ,horizontal: a
             ,length: c
             ,max: e
             ,min: d
             ,step: f
             ,value: g};
   });
   _elm.Slider.values = {_op: _op
                        ,SliderStyle: SliderStyle
                        ,defaultSlider: defaultSlider
                        ,slider: slider};
   return _elm.Slider.values;
};
// A note to the reader:
// This file is concatenated with debuggerInterface.elm's compiled
// javascript and debug-core.js. This is done at build time in Setup.hs

var prettyPrint = function(){

    var independentElm = {};
    var NList = Elm.Native.List.make(independentElm);
    var List = Elm.List.make(independentElm);
    var ElmArray = Elm.Array.make(independentElm);
    var Dict = Elm.Dict.make(independentElm);
    var Tuple2 = Elm.Native.Utils.make(independentElm).Tuple2;

    var toString = function(v, separator) {
        var type = typeof v;
        if (type === "function") {
            var name = v.func ? v.func.name : v.name;
            return '<function' + (name === '' ? '' : ': ') + name + '>';
        } else if (type === "boolean") {
            return v ? "True" : "False";
        } else if (type === "number") {
            return v.toFixed(2).replace(/\.0+$/g, '');
        } else if ((v instanceof String) && v.isChar) {
            return "'" + addSlashes(v) + "'";
        } else if (type === "string") {
            return '"' + addSlashes(v) + '"';
        } else if (type === "object" && '_' in v && probablyPublic(v)) {
            var output = [];
            for (var k in v._) {
                for (var i = v._[k].length; i--; ) {
                    output.push(k + " = " + toString(v._[k][i], separator));
                }
            }
            for (var k in v) {
                if (k === '_') continue;
                output.push(k + " = " + toString(v[k], separator));
            }
            if (output.length === 0) return "{}";
            var body = "\n" + output.join(",\n");
            return "{" + body.replace(/\n/g,"\n" + separator) + "\n}";
        } else if (type === "object" && 'ctor' in v) {
            if (v.ctor.substring(0,6) === "_Tuple") {
                var output = [];
                for (var k in v) {
                    if (k === 'ctor') continue;
                    output.push(toString(v[k], separator));
                }
                return "(" + output.join(", ") + ")";
            } else if (v.ctor === "_Array") {
                var list = ElmArray.toList(v);
                return "Array.fromList " + toString(list, separator);
            } else if (v.ctor === "::") {
                var output = '[\n' + toString(v._0, separator);
                v = v._1;
                while (v && v.ctor === "::") {
                    output += ",\n" + toString(v._0, separator);
                    v = v._1;
                }
                return output.replace(/\n/g,"\n" + separator) + "\n]";
            } else if (v.ctor === "[]") {
                return "[]";
            } else if (v.ctor === "RBNode" || v.ctor === "RBEmpty") {
                var cons = F3(function(k,v,acc){return NList.Cons(Tuple2(k,v),acc)});
                var list = A3(Dict.foldr, cons, NList.Nil, v);
                var name = "Dict";
                if (list.ctor === "::" && list._0._1.ctor === "_Tuple0") {
                    name = "Set";
                    list = A2(List.map, function(x){return x._0}, list);
                }
                return name + ".fromList " + toString(list, separator);
            } else {
                var output = "";
                for (var i in v) {
                    if (i === 'ctor') continue;
                    var str = toString(v[i], separator);
                    var parenless = str[0] === '{' ||
                                    str[0] === '<' ||
                                    str[0] === "[" ||
                                    str.indexOf(' ') < 0;
                    output += ' ' + (parenless ? str : "(" + str + ')');
                }
                return v.ctor + output;
            }
        }
        if (type === 'object' && 'recv' in v) return '<signal>';
        return "<internal structure>";
    };

    function addSlashes(str) {
        return str.replace(/\\/g, '\\\\')
                  .replace(/\n/g, '\\n')
                  .replace(/\t/g, '\\t')
                  .replace(/\r/g, '\\r')
                  .replace(/\v/g, '\\v')
                  .replace(/\0/g, '\\0')
                  .replace(/\'/g, "\\'")
                  .replace(/\"/g, '\\"');
    }

    function probablyPublic(v) {
        var keys = Object.keys(v);
        var len = keys.length;
        if (len === 3
            && 'props' in v
            && 'element' in v) return false;
        if (len === 5
            && 'horizontal' in v
            && 'vertical' in v
            && 'x' in v
            && 'y' in v) return false;
        if (len === 7
            && 'theta' in v
            && 'scale' in v
            && 'x' in v
            && 'y' in v
            && 'alpha' in v
            && 'form' in v) return false;
        return true;
    }

    return toString;
}();
// A note to the reader:
// This file is concatenated with debuggerInterface.elm's compiled
// javascript, toString.js, and reactor.js.
// This is done at build time in Setup.hs.

// Options:

// Expose internal swap function, disable swap button, no socket
// options.externalSwap = boolean

ElmRuntime.debugFullscreenWithOptions = function(options) {

    return function(module, moduleFile, swapState /* =undefined */) {
        var createdSocket = false;
        var elmPermitSwaps = true;

        var ELM_DEBUGGER_ID = "elmToolPanel";
        var ELM_DARK_GREY = "#4A4A4A";
        var ELM_LIGHT_GREY = "#E4E4E4";

        var mainHandle = Elm.fullscreenDebugHooks(module, swapState);
        var debuggerHandle = initDebugger();
        if (!options.externalSwap) {
            initSocket();
        }

        parent.window.addEventListener("message", function(e) {
            if (e.data === "elmNotify") {
                var currentPosition = mainHandle.debugger.getMaxSteps();
                if (debuggerHandle.ports) {
                    debuggerHandle.ports.eventCounter.send(currentPosition);
                    sendWatches(currentPosition);
                }
            }
        }, false);

        function createDebuggingElement() {
            var debuggingPanelExpanded = true;
            var debuggerWidth = 275;

            var debugTools = document.createElement("div");
            debugTools.id = ELM_DEBUGGER_ID;

            var debuggerDiv = document.createElement("div");
            debuggerDiv.id = "elmDebugger";
            debuggerDiv.style.overflow = "hidden";

            // Create and style the panel
            debugTools.style.background = ELM_DARK_GREY;
            debugTools.style.width = debuggerWidth + "px";
            debugTools.style.height = "100%";
            debugTools.style.position = "absolute";
            debugTools.style.top = "0px";
            debugTools.style.right = "0px";
            debugTools.style.transitionDuration = "0.3s";
            debugTools.style.opacity = 0.97;
            debugTools.style.zIndex = 1;

            // Prevent clicks from reaching the main elm instance under the panel
            function stopEvents(e) {
                if (!e) {
                    var e = window.event;
                }
                e.cancelBubble = true;
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
            }
            debugTools.addEventListener("click", stopEvents);

            // Create and style the button
            var tabWidth = 25;
            var debugTab = document.createElement("div");
            debugTab.id = "debugToggle";
            debugTab.style.position = "absolute";
            debugTab.style.width = tabWidth + "px";
            debugTab.style.height = "60px";
            debugTab.style.top = window.innerHeight / 2 + "px";
            debugTab.style.left = "-" + tabWidth + "px";
            debugTab.style.borderTopLeftRadius = "3px";
            debugTab.style.borderBottomLeftRadius = "3px";
            debugTab.style.background = ELM_DARK_GREY;


            // Wire the button
            debugTab.onclick = function() {
                var toolPanel = document.getElementById("elmToolPanel");
                if (debuggingPanelExpanded){
                    toolPanel.style.width = "0px";
                    debuggingPanelExpanded = false;
                } else {
                    toolPanel.style.right = "0px";
                    toolPanel.style.width = debuggerWidth + "px";
                    debuggingPanelExpanded = true;
                }
            };

            debugTools.appendChild(debugTab);
            debugTools.appendChild(debuggerDiv);
            return debugTools;
        }

        function initDebugger() {
            function scrubber(position) {
                if (mainHandle.debugger.getPaused()) {
                    mainHandle.debugger.stepTo(position);
                    sendWatches(position);
                }
            }

            function elmPauser(doPause) {
                if (doPause) {
                  mainHandle.debugger.pause();
                } else {
                    mainHandle.debugger.kontinue();
                }
            }

            function elmRestart() {
                mainHandle.debugger.restart();
                sendWatches(0);
            }

            function elmSwap(permitSwaps) {
                elmPermitSwaps = permitSwaps;
            }

            var debugTools = createDebuggingElement();
            document.body.appendChild(debugTools);
            var debuggerDiv = document.getElementById("elmDebugger");

            var handle = Elm.embed(Elm.DebuggerInterface, debuggerDiv,
                { eventCounter: 0,
                  watches: [],
                  showSwap: !options.externalSwap
                });
            handle.ports.scrubTo.subscribe(scrubber);
            handle.ports.pause.subscribe(elmPauser);
            handle.ports.restart.subscribe(elmRestart);
            handle.ports.permitSwap.subscribe(elmSwap);
            return handle;
        }

        function sendWatches(position) {
            var separator = "  ";
            var output = [];

            var watchAtPoint = mainHandle.debugger.watchTracker.frames[position];

            for(key in watchAtPoint) {
                var value = watchAtPoint[key];
                // The toString object is defined in toString.js
                // and is prepended to this file at build time.
                var stringified = prettyPrint(value, separator);
                output.push([key, stringified]);
            }
            debuggerHandle.ports.watches.send(output);
        }

        function initSocket() {
            createdSocket = true;
            // "/todo.html" => "todo.elm"
            moduleFile = moduleFile || window.location.pathname.substr(1).split(".")[0] + ".elm";
            var socketLocation = "ws://" + window.location.host + "/socket?file=" + moduleFile;
            var serverConnection = new WebSocket(socketLocation);
            serverConnection.onmessage = function(event) {
                if (elmPermitSwaps && debuggerHandle.ports) {
                    swap(event.data);
                }
            };
            window.addEventListener("unload", function() {
                serverConnection.close();
            });
        }

        function swap(raw) {
            var debuggerDiv = document.getElementById(ELM_DEBUGGER_ID);
            var result = JSON.parse(raw);
            var js = result.success;
            var errorMessage = result.error;
            var error = document.getElementById('ErrorMessage');
            if (error) {
                error.parentNode.removeChild(error);
            }
            if (js) {
                window.eval(js);
                var moduleStr = js.match(/(Elm\..+)\ =\ \1/)[1];
                var module = window.eval(moduleStr);
                if (mainHandle.debugger) {
                    var debuggerState = mainHandle.debugger.getSwapState();
                    mainHandle.debugger.dispose();
                    mainHandle.dispose();

                    mainHandle = Elm.fullscreenDebugHooks(module, debuggerState);

                    // The div that rejects events must be after Elm
                    var ignoringDiv = document.getElementById("elmEventIgnorer");
                    if (ignoringDiv) {
                        ignoringDiv.parentNode.appendChild(ignoringDiv);
                    }
                }
                else {
                    mainHandle = mainHandle.swap(module);
                }
            } else if (errorMessage) {
                var errorNode = document.createElement("pre");
                errorNode.id = "ErrorMessage";
                errorNode.innerHTML = errorMessage;
                errorNode.style.zindex = 1;
                errorNode.style.position = "absolute";
                errorNode.style.top = "0";
                errorNode.style.left = "0";
                errorNode.style.color = ELM_DARK_GREY;
                errorNode.style.backgroundColor = ELM_LIGHT_GREY;
                errorNode.style.padding = "1em";
                errorNode.style.margin = "1em";
                errorNode.style.borderRadius = "10px";

                document.body.appendChild(errorNode);
            }
        }

        if (!options.externalSwap) {
            mainHandle.debugger.swap = swap;
        }
        return mainHandle;
    };
};
// A note to the reader:
// This file is concatenated with debuggerInterface.elm's compiled
// javascript, toString.js, and debug-core.js. This is done at build time in Setup.hs

Elm.debugFullscreen = ElmRuntime.debugFullscreenWithOptions({
    externalSwap: false
});
