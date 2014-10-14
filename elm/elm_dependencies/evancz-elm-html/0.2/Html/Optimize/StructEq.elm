module Html.Optimize.StructEq where
{-| Since all Elm functions are pure we have a guarantee that the same input
will always result in the same output. This module gives us tools to be lazy
about building Html that utilize this fact.

Rather than immediately applying functions to their arguments, the `lazy`
functions just bundle the function and arguments up for later. When diffing
the old and new virtual DOM, it checks to see if all the arguments are
**structurally** equal. If so, it skips calling the function!

Be careful with these checks. Structural equality checks are not necessarily
cheap, especially with larger objects, so this may not be worth it. Always
benchmark to see!

@docs lazy, lazy2, lazy3
-}

import Html (Html)
import Native.Html

lazy : (a -> Html) -> a -> Html
lazy = Native.Html.lazyStruct

lazy2 : (a -> b -> Html) -> a -> b -> Html
lazy2 = Native.Html.lazyStruct2

lazy3 : (a -> b -> c -> Html) -> a -> b -> c -> Html
lazy3 = Native.Html.lazyStruct3
