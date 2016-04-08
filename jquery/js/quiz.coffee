class Quiz
  constructor: (@language, @questions) ->
    @currentQuestion = 0
    @results = "none"

questionsL = [
  { language: "Latin", question: "night", choices: [ "Iudex", "Nox", "Dies" ], answer: "Nox", guess: "" }
  { language: "Latin", question: "day", choices: [ "Canis", "Agricola", "Dies" ], answer: "Dies", guess: "" }
  { language: "Latin", question: "fire", choices: [ "Ignis", "Puer", "Puella" ], answer: "Ignis", guess: "" }
  { language: "Latin", question: "boy", choices: [ "Nox", "Puer", "Vir" ], answer: "Puer", guess: "" }
  { language: "Latin", question: "girl", choices: [ "Puella", "Femina", "Virgis" ], answer: "Puella", guess: "" }
  { language: "English", question: "collum", choices: [ "Column", "Neck", "Colon" ], answer: "Neck", guess: "" }
  { language: "English", question: "tuba", choices: [ "Trumpet", "Tuba", "Two" ], answer: "Trumpet", guess: "" }
  { language: "English", question: "cave", choices: [ "Cave", "Cavern", "Beware" ], answer: "Beware", guess: "" }
  { language: "English", question: "ars", choices: [ "Ass", "Arc", "Art" ], answer: "Art", guess: "" }
  { language: "English", question: "vox", choices: [ "Voice", "Volume", "Voracious" ], answer: "Voice", guess: "" }
]
questionsJ = [
  { language: "Japanese", question: "one", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u3044\u3061", guess: "" }
  { language: "Japanese", question: "two", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u306B", guess: "" }
  { language: "Japanese", question: "three", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u3055\u3093", guess: "" }
  { language: "Japanese", question: "four", choices: [ "\u3057", "\u3054", "\u308D\u304F" ], answer: "\u3057", guess: "" }
  { language: "Japanese", question: "five", choices: [ "\u3057", "\u3054", "\u308D\u304F" ], answer: "\u3054", guess: "" }
  { language: "English", question: "\u308D\u304F", choices: [ "four", "five", "six" ], answer: "six", guess: "" }
  { language: "English", question: "\u3057\u3061", choices: [ "seven", "eight", "nine" ], answer: "seven", guess: "" }
  { language: "English", question: "\u306F\u3061", choices: [ "seven", "eight", "nine" ], answer: "eight", guess: "" }
  { language: "English", question: "\u304F", choices: [ "seven", "eight", "nine" ], answer: "nine", guess: "" }
  { language: "English", question: "\u3058\u3085\u3046", choices: [ "ten", "eleven", "twelve" ], answer: "ten", guess: "" }
]

latinQuiz = new Quiz "Ancient Latin", questionsL
japaneseQuiz = new Quiz "Japanese", questionsJ

correct = (qs) ->
  isCorrect = (q) -> q.answer is q.guess

  cs = q for q in qs when isCorrect q
  cs.length

draft = (q) ->
  questionTemplate = $("#question-template").html()
  theTemplate = Handlebars.compile(questionTemplate)
  c = q.currentQuestion
  u = q.questions[c]

  if c < q.questions.length
    Handlebars.registerHelper "check", do (guess) -> if this==guess then "checked" else ""

    $("#question").html theTemplate u

    if u.guess is ""
      $("#next").attr "disabled", "disabled"
    else
      $("#next").removeAttr "disabled"

    if c > 0
      $("#previous").removeAttr "disabled"
    else
      $("#previous").attr "disabled", "disabled"

    cs = "#{choice}" for choice in u.choices
    for c in cs
      do e -> $(e).click do () -> $("#next").removeAttr "disabled"

    $("#form").show 1000
  else
    $("#form").hide()

  $("#progress").prop "value", c

report () ->
  n = quiz.questions.length

  switch quiz.language
    when "Ancient Latin"
      c = $("#latinCorrect")
      t = $("#latinTotal")
      r = $("#latinResults")
    when "Japanese"
      c = $("#japaneseCorrect")
      t = $("#japaneseTotal")
      r = $("#japaneseResults")

  c.text correct quiz.questions
  t.text n
  r.show # Are () necessary here?
  quiz.results = "block"

  $("#form").hide()
  $("input:radio").removeAttr "checked"
  $("#progress").prop "value", n

respond = (e) ->
  finished = (q) -> q.currentQuestion < q.questions.length

  quiz.questions[quiz.currentQuestion].guess = $("input:checked").val()

  quiz.currentQuestion++
  unless finished quiz
    $("#form").hide 250, do () -> draft quiz
    $("input:radio").removeAttr "checked"
  else
    report()

  off # Stop event propagation.

previous = (e) ->
  quiz.currentQuestion--
  draft quiz

subject (target) ->
  s = target.toString()
  s.substring (s.indexOf "#") + 1

switchTabs = (e) ->
  s = $(".subject")
  i = $("#intro")
  f = $("#form")
  p = $("#progress")
  lr = $("#latinResults")
  jr = $("#japaneseResults")

  showResults = (q) -> q.results is "block"

  showQuiz = () ->
    i.hide()
    f.show()
    p.show()

    draft quiz
    p.prop "max", quiz.questions.length

  switch subject e.target
    when "intro"
      i.show()
      f.hide()
      p.hide()
      s.text "Subject"
    when "latin"
      quiz = latinQuiz
      jr.hide()
      lr.show() if showResults quiz
      showQuiz()
    when "japanese"
      quiz = japaneseQuiz
      lr.hide()
      jr.show() if showResults quiz
      showQuiz()
  s.text quiz.language # Are () necessary here?

$("a[data-toggle='tab']").on "show", switchTabs
$("#form").submit respond
$("#previous").click previous

