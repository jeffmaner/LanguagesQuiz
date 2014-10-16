module LanguageQuiz where

-- $ elm --make --only-js --bundle-runtime Quiz.elm

import Array (fromList, get, set, toList)
--import Debug
import Graphics.Input as Input
import Html
import Html (..)
import Html.Attributes (..)
import Html.Events (..)
import Html.Tags (..)
import Html.Optimize.RefEq as Ref
import Window


{-| Quiz implemented in Elm, using plain HTML and CSS for rendering.

This application is broken up into four distinct parts:

  1. Model  - a full definition of the application's state
  2. Update - a way to step the application state forward
  3. View   - a way to visualize our application state with HTML
  4. Inputs - the signals necessary to manage events

This clean division of concerns is a core part of Elm. You can read more about
this in the Pong tutorial: http://elm-lang.org/blog/Pong.elm

This program is not particularly large, so definitely see the following
document for notes on structuring more complex GUIs with Elm:
https://gist.github.com/evancz/2b2ba366cae1887fe621
-}

nth : Int -> [a] -> Maybe a
nth n xs = get n <| fromList xs 

---- MODEL ----

-- The full application state of our quiz app.
type State = { currentTab :  Tab
             , allTabs    : [Tab]}

type Tab = { tLanguage : Language
           , tQuiz     : Quiz
           , tResults  : Bool }

type Quiz = { currentQuestion : Int
            , language        : Language
            , questions       : [Question] }

data Language = English
              | Japanese
              | Latin

type Question = { qLanguage:  Language
                , qText    :  String
                , qChoices : [String]
                , qAnswer  :  String
                , qGuess   :  String }

questionsL = [
  { qLanguage = Latin,   qText = "night",  qChoices = ["Iudex", "Nox", "Dies"],         qAnswer = "Nox",     qGuess = "" },
  { qLanguage = Latin,   qText = "day",    qChoices = ["Canis", "Agricola", "Dies"],    qAnswer = "Dies",    qGuess = "" },
  { qLanguage = Latin,   qText = "fire",   qChoices = ["Ignis", "Puer", "Puella"],      qAnswer = "Ignis",   qGuess = "" },
  { qLanguage = Latin,   qText = "boy",    qChoices = ["Nox", "Puer", "Vir"],           qAnswer = "Puer",    qGuess = "" },
  { qLanguage = Latin,   qText = "girl",   qChoices = ["Puella", "Femina", "Virgis"],   qAnswer = "Puella",  qGuess = "" },
  { qLanguage = English, qText = "collum", qChoices = ["Column", "Neck", "Colon"],      qAnswer = "Neck",    qGuess = "" },
  { qLanguage = English, qText = "tuba",   qChoices = ["Trumpet", "Tuba", "Two"],       qAnswer = "Trumpet", qGuess = "" },
  { qLanguage = English, qText = "cave",   qChoices = ["Cave", "Cavern", "Beware"],     qAnswer = "Beware",  qGuess = "" },
  { qLanguage = English, qText = "ars",    qChoices = ["Ass", "Arc", "Art"],            qAnswer = "Art",     qGuess = "" },
  { qLanguage = English, qText = "vox",    qChoices = ["Voice", "Volume", "Voracious"], qAnswer = "Voice",   qGuess = "" } ]


questionsJ = [
  { qLanguage = Japanese, qText = "one"   , qChoices = ["いち", "に", "さん"]     , qAnswer = "いち" , qGuess = "" },
  { qLanguage = Japanese, qText = "two"   , qChoices = ["いち", "に", "さん"]     , qAnswer = "に"   , qGuess = "" },
  { qLanguage = Japanese, qText = "three" , qChoices = ["いち", "に", "さん"]     , qAnswer = "さん" , qGuess = "" },
  { qLanguage = Japanese, qText = "four"  , qChoices = ["し", "ご", "ろく"]       , qAnswer = "し"   , qGuess = "" },
  { qLanguage = Japanese, qText = "five"  , qChoices = ["し", "ご", "ろく"]       , qAnswer = "ご"   , qGuess = "" },
  { qLanguage = English , qText = "ろく"  , qChoices = ["four", "five", "six"]    , qAnswer = "six"  , qGuess = "" },
  { qLanguage = English , qText = "しち"  , qChoices = ["seven", "eight", "nine"] , qAnswer = "seven", qGuess = "" },
  { qLanguage = English , qText = "はち"  , qChoices = ["seven", "eight", "nine"] , qAnswer = "eight", qGuess = "" },
  { qLanguage = English , qText = "く"    , qChoices = ["seven", "eight", "nine"] , qAnswer = "nine" , qGuess = "" },
  { qLanguage = English , qText = "じゅう", qChoices = ["ten", "eleven", "twelve"], qAnswer = "ten"  , qGuess = "" } ]


englishQuiz  = { currentQuestion=0, language=English , questions=[]         }
latinQuiz    = { currentQuestion=0, language=Latin   , questions=questionsL }
japaneseQuiz = { currentQuestion=0, language=Japanese, questions=questionsJ }

introTab    = { tLanguage=English , tQuiz=englishQuiz , tResults=False }
latinTab    = { tLanguage=Latin   , tQuiz=latinQuiz   , tResults=False }
japaneseTab = { tLanguage=Japanese, tQuiz=japaneseQuiz, tResults=False }

initialState : State
initialState = { currentTab=introTab, allTabs=[introTab, latinTab, japaneseTab] }


---- UPDATE ----

-- A description of the kinds of actions that can be performed on the state of
-- the application. See the following post for more info on this pattern and
-- some alternatives: https://gist.github.com/evancz/2b2ba366cae1887fe621
data Action = NoOp
            | NextQuestion
            | PreviousQuestion
            | ChangeTab Tab
            | Finish
            | Answer String

-- How we step the state forward for any given action
step : Action -> State -> State
step action s =
     let updateTab f t = { t | tQuiz <- f t.tQuiz }
      in case action of
          NoOp             -> s
          NextQuestion     -> { s | currentTab <- updateTab moveToNextQuestion     s.currentTab }
          PreviousQuestion -> { s | currentTab <- updateTab moveToPreviousQuestion s.currentTab }
          ChangeTab newTab -> let saveTab c t a = if c.tLanguage==t.tLanguage then c::a else t::a
                                  updateState t ts = { currentTab=t, allTabs=ts }
                               in updateState newTab <| reverse <| foldl (\t->saveTab s.currentTab t) [] s.allTabs
          Finish           -> let finishTab t = { t | tResults <- True }
                               in { s | currentTab <- finishTab s.currentTab }
          Answer answer    -> let saveAnswer t answer = { t | tQuiz <- answerQuestion t.tQuiz answer }
                                  answerQuestion quiz answer = { quiz | questions <- setGuess quiz.currentQuestion quiz.questions answer }
                                  setGuess n qs answer = let qs' = fromList qs
                                                             q = newQuestion n qs answer
                                                          in toList <| set n q qs'
                                  newQuestion n qs answer = let q = case nth n qs of
                                                                       Nothing -> { qLanguage = English, qText = "", qChoices = [], qAnswer = "", qGuess = "" }
                                                                       Just r  -> r
                                                             in { q | qGuess <- answer }
                              in { s | currentTab <- saveAnswer s.currentTab answer }

moveToNextQuestion     : Quiz -> Quiz
moveToNextQuestion     q = { q | currentQuestion <- q.currentQuestion + 1 }

moveToPreviousQuestion : Quiz -> Quiz
moveToPreviousQuestion q = { q | currentQuestion <- q.currentQuestion - 1 }


---- VIEW ----

view : State -> Html
view s =
  div [ class "span10" ] -- "col-xs-10"
      [ section [ id "content" ]
                (tabs s) ]

tabs : State -> [Html]
tabs s =
  let isActive quizLanguage = s.currentTab.tQuiz.language == quizLanguage
      tabPane quizLanguage = "tab-pane" ++ if isActive quizLanguage then " active" else ""
      activeLI quizLanguage = if isActive quizLanguage then "active" else "inactive"
      makeLI quizLanguage hRef txt t =
        li [ class <| activeLI quizLanguage ]
           [ a [href hRef, attr "data-toggle" "tab", onclick actions.handle (\_->ChangeTab t) ]
               [ text txt ] ]
      isCorrect q = q.qGuess == q.qAnswer
      questionOrResults t = let qs = t.tQuiz.questions
                                m = qs |> filter isCorrect |> length |> show
                                n = length qs |> show
                                txt = text <| "You answered " ++ m ++ " out of " ++ n ++ " " ++ (show t.tLanguage) ++ " questions correctly."
                             in if t.tResults
                                then txt
                                else let qz = t.tQuiz
                                      in case nth qz.currentQuestion qz.questions of
                                            Nothing -> txt
                                            Just q  -> question q
      questionForm =
        let c = s.currentTab.tQuiz.currentQuestion
            qs = s.currentTab.tQuiz.questions
            n = length qs
            prog = 100 * c // n |> show
            disablePrevious = c < 1
            disableNext     = c > n || guess == ""
            guess = case nth c qs of
                      Nothing -> ""
                      Just q  -> q.qGuess
         in node "form"
                 [ id "form" ]
                 [ div [ id "question" ]
                       [ questionOrResults s.currentTab ],
                   input [ attr "type" "button", id "previous", value "Previous", onclick actions.handle (\_->PreviousQuestion), disabled disablePrevious ] [],
                   input [ attr "type" "button", id "next"    , value "Next"    , onclick actions.handle (\_->NextQuestion)    , disabled disableNext     ] [],
                   br [] [],
                   progress [ id "progress", value prog, attr "max" "100" ] [] ]
      tab lang = head <| filter (\t->t.tLanguage==lang) s.allTabs

   in [ ul [ class "nav nav-tabs", id "subjectTabs" ]
           [ makeLI English  "#intro"    "Introduction"  <| tab English,
             makeLI Latin    "#latin"    "Ancient Latin" <| tab Latin  ,
             makeLI Japanese "#japanese" "Japanese"      <| tab Japanese ],
        div [ class "tab-content" ]
            [ div [ class <| tabPane English, id "intro" ]
                  [ text "Here you may take a brief quiz in Ancient Latin vocabulary, or Japanese counting from one to ten." ],
              div [ class <| tabPane Latin   , id "latin"    ] [ questionForm ],
              div [ class <| tabPane Japanese, id "japanese" ] [ questionForm ] ] ]

question : Question -> Html
question q =
  let box c g = input [ attr "type" "radio",
                        name "answer",
                        id c,
                        value c,
                        checked (c==q.qGuess),
                        onclick actions.handle (\_->Answer c) ] []
      makeTD g c = td [ class "choice" ] [ label [ id "answer0Label", for c ] [text c, br [] [], box c g] ]
      tds = q.qChoices |> map (makeTD q.qGuess)
   in div [ id "questionText" ]
          [ text <| "What is the " ++ (show q.qLanguage) ++ " word for " ++ q.qText ++ "?",
            table
            [ style [ prop "margin-bottom" "5px" ] ]
            [ tr [] tds ] ]

-- wire the entire application together
main : Signal Element
main = lift2 scene state Window.dimensions

scene : State -> (Int,Int) -> Element
scene s (w,h) =
  let subject t = if t.tLanguage==English then "" else show t.tLanguage
      m = main' [] -- TODO: use node instead of main'?
                [ header [ class "language" ]
                         [ h1 [] [ text <| subject s.currentTab ++ " Quiz" ] ],
                  div [ class "container-fluid" ]
                      [ div [ class "row-fluid" ]
                            [ div [ id "left", class "span2" ] -- "col-xs-2"
                                  [ text <| "A brief quiz on " ++ subject s.currentTab ++ " vocabulary implemented via HTML 5, CSS 3, and JavaScript via Elm." ],
                              view s ] ],
                  footer []
                         [ h6 []
                              [ text "Programmed by Jeff Maner.",
                                br [] [],
                                time [ attr "pubdate" "",
                                       attr "datetime" "2014-10-15" ]
                                [ text "2014 Oct 15" ] ] ] ]
   in container w h midTop (Html.toElement w h m)

-- manage the state of our application over time
state : Signal State
state = foldp step startingState actions.signal

startingState : State
startingState = initialState

-- actions from user input
actions : Input.Input Action
actions = Input.input NoOp
