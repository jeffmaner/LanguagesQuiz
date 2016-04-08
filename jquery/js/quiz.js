(function () {
  // The instructions state to store the questions in a json file. But Chrome won't allow loading of local files,
  // and I cannot get it to work in FireFox. So, the questions stay here.
  let Quiz = function(language, questions) {
        this.language = language;
        this.questions = questions;
        this.currentQuestion = 0;
        this.results = "none";
      },
      questionsL = [
        { language: "Latin", question: "night", choices: [ "Iudex", "Nox", "Dies" ], answer: "Nox", guess: "" },
        { language: "Latin", question: "day", choices: [ "Canis", "Agricola", "Dies" ], answer: "Dies", guess: "" },
        { language: "Latin", question: "fire", choices: [ "Ignis", "Puer", "Puella" ], answer: "Ignis", guess: "" },
        { language: "Latin", question: "boy", choices: [ "Nox", "Puer", "Vir" ], answer: "Puer", guess: "" },
        { language: "Latin", question: "girl", choices: [ "Puella", "Femina", "Virgis" ], answer: "Puella", guess: "" },
        { language: "English", question: "collum", choices: [ "Column", "Neck", "Colon" ], answer: "Neck", guess: "" },
        { language: "English", question: "tuba", choices: [ "Trumpet", "Tuba", "Two" ], answer: "Trumpet", guess: "" },
        { language: "English", question: "cave", choices: [ "Cave", "Cavern", "Beware" ], answer: "Beware", guess: "" },
        { language: "English", question: "ars", choices: [ "Ass", "Arc", "Art" ], answer: "Art", guess: "" },
        { language: "English", question: "vox", choices: [ "Voice", "Volume", "Voracious" ], answer: "Voice", guess: "" } ],
      questionsJ = [
        { language: "Japanese", question: "one", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u3044\u3061", guess: "" },
        { language: "Japanese", question: "two", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u306B", guess: "" },
        { language: "Japanese", question: "three", choices: [ "\u3044\u3061", "\u306B", "\u3055\u3093" ], answer: "\u3055\u3093", guess: "" },
        { language: "Japanese", question: "four", choices: [ "\u3057", "\u3054", "\u308D\u304F" ], answer: "\u3057", guess: "" },
        { language: "Japanese", question: "five", choices: [ "\u3057", "\u3054", "\u308D\u304F" ], answer: "\u3054", guess: "" },
        { language: "English", question: "\u308D\u304F", choices: [ "four", "five", "six" ], answer: "six", guess: "" },
        { language: "English", question: "\u3057\u3061", choices: [ "seven", "eight", "nine" ], answer: "seven", guess: "" },
        { language: "English", question: "\u306F\u3061", choices: [ "seven", "eight", "nine" ], answer: "eight", guess: "" },
        { language: "English", question: "\u304F", choices: [ "seven", "eight", "nine" ], answer: "nine", guess: "" },
        { language: "English", question: "\u3058\u3085\u3046", choices: [ "ten", "eleven", "twelve" ], answer: "ten", guess: "" } ],
      latinQuiz = new Quiz("Ancient Latin", questionsL),
      japaneseQuiz = new Quiz("Japanese", questionsJ),
      quiz = {};

  function numberCorrect(qs) {
    function isCorrect(q) {
      return q.answer === q.guess;
    }

    return _.filter(qs, isCorrect).length;
  }

  function draft(q) {
    let questionTemplate = $("#question-template").html(),
        template = Handlebars.compile(questionTemplate),
        c = q.currentQuestion,
        u = q.questions[c];

    if (c < q.questions.length) {
      Handlebars.registerHelper("check", function(guess) { return this===guess ? "checked" : ""; });

      $("#question").html(template(u));

      if (u.guess === "")
        $("#next").attr("disabled", "disabled");
      else
        $("#next").removeAttr("disabled");

      if (c>0)
        $("#previous").removeAttr("disabled");
      else
        $("#previous").attr("disabled", "disabled");

      _.each(_.map(u.choices, function (choice) { return "#"+choice; }),
             function(e,i,xs) {
               $(e).click(function () { $("#next").removeAttr("disabled"); });
             });

      $("#form").show(1000);
    } else {
      $("#form").hide();
    }
    $("#progress").prop("value", c);
  }

  function report() {
    let n = quiz.questions.length;
    var c, t, r;

    switch (quiz.language) {
      case "Ancient Latin":
        c = $("#latinCorrect");
        t = $("#latinTotal");
        r = $("#latinResults");
        break;
      case "Japanese":
        c = $("#japaneseCorrect");
        t = $("#japaneseTotal");
        r = $("#japaneseResults");
        break;
    }
    c.text(numberCorrect(quiz.questions));
    t.text(n);
    r.show();
    quiz.results = "block";

    $("#form").hide();
    $("input:radio").removeAttr("checked");
    $("#progress").prop("value", n);
  }

  function respond(e) {
    quiz.questions[quiz.currentQuestion].guess = $("input:checked").val();

    quiz.currentQuestion++;
    if (quiz.currentQuestion < quiz.questions.length) {
      $("#form").hide(250, function () { draft(quiz); });
      $("input:radio").removeAttr("checked");
    } else {
      report();
    }

    return false; // Stop event propagation.
  }

  function previous(e) {
    quiz.currentQuestion--;
    draft(quiz);
  }

  function subject(target) {
    let s = target.toString();
    return s.substring(s.indexOf("#")+1);
  }

  function switchTabs(e) {
    let s = $(".subject"),
        i = $("#intro"),
        f = $("#form"),
        p = $("#progress"),
        lr = $("#latinResults"),
        jr = $("#japaneseResults");

    function showResults(q) { return q.results === "block"; }

    function showQuiz() {
      i.hide();
      f.show();
      p.show();

      draft(quiz);
      p.prop("max", quiz.questions.length);
    }

    switch(subject(e.target)) {
      case "intro":
        i.show();
        f.hide();
        p.hide();
        s.text("Subject");
        break;
      case "latin":
        quiz = latinQuiz;
        jr.hide();
        if (showResults(quiz)) lr.show();
        showQuiz();
        break;
      case "japanese":
        quiz = japaneseQuiz;
        lr.hide();
        if (showResults(quiz)) jr.show();
        showQuiz();
        break;
    }
    s.text(quiz.language);
  }

  $("a[data-toggle='tab']").on("show", switchTabs);
  $("#form").submit(respond);
  $("#previous").click(previous);
}());
