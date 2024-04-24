# Introduction

Here we describe **webgen**, which helps add high quality interactivity and visualisation to any d8m program. As the name implies, the technology actually generates what is in essence an interactive website from a specification. This is a "website" designed for local interaction with a single client using localhost. It uses a standard browser but doesn't handle user accounts, cookies, security, or other issues relevant to "real" websites. Web serving is a well known instance of a client-server architecture, and user interface software is almost always structured in this way. Although web protocols have their quirks, they are by far the most well supported UI software at present, which is the main reason for webgen's design approach. 

Webgen uses the well known `React` framework for the client. It provides a default set of React components adapted for webgen, and you can develop components yourself or use components developed by others. The only webgen-specific requirement on user defined components is some documentation (of props) in a specific form; details are given later in this document. 

As React is a javascript based framework, a webgen specification will include fragments of javascript in addition to the React components, so you'll need a reasonable familiarity with javascript and React to use webgen effectively.

We sketch the development process here; more detailed coverage is in the final section of this document, see [here](#Using-Webgen). You start with a d8m program, `X.d8m`; you want to visualize and/or interact with its data in some way. You'll plan the interaction design and layout, then write it down using the specification language described in this document. You'll add some d8m code to implement the server side actions required for the interactions you require, which you've written into the specification. The final spec file extends `X.d8m` with this glue code and specification statements. 

Now set up a react app with create-react-app, and run the webgen translator on this file, directing its output to the `src/` directory of the react app. The translator parses the file, figuring out which parts are specification and which are d8m, interpreting the former and copying the latter to the server output. When the specification is error free, the result of running the translator is two files for the client (named `App.js` and `App.css`) and one .d8m file for the server. Running webgen also copies needed components to the src/ directory. The `App.js` file imports the react components you've specified, copies javascript code in your spec file, and synthesizes certain other definitions needed to implement your spec. 

The server code is a d8m file consisting of the d8m code in the source file plus other code synthesized by the translator. If the spec file is `X.d8m` and you tell webgen to run server interaction on port `nnnn`, then the server file is named `XSrvrPortnnnn.d8m`. Webgen works most naturally if your specification file is top level in the create-react-app tree. Compile the server file, then run your interactive app by starting the server, running "npm start" to get the react interpreter going on the `src/` directory, and pointing your browser at localhost port specified to npm start. Note that in development, React uses one localhost port and the server uses a different one. 

Webgen takes care of a number of issues relevant to UI developers. It performs some level of typechecking on your instantiations of React components, which can save development time. It takes care of various details involved in setting up a webserver using go's `net/http` package, handling client-server interactions in javascript, and so on. It provides a framework for styling that you may find attractive. In my experience, webgen's packaging of somewhat abstract ways to think about desired interactions helps reduce the conceptual complexity of UI development. Still, there is a learning curve. If you get through this document, you'll be well on your way.

Webgen's focus for now is on fast, low overhead creation of useful, interactive, data-oriented applications. Charting is well developed, using recharts.js as the client side charting package. Webgen is unusual in generating both server and client code, since most existing frameworks provide either client or server but not both. In order to maintain focus, there are a number of areas that webgen doesn't pay a lot of attention to. For example, small screens, media queries. Webgen requires release 18 of React and expects you to use the "modern" version of React and javascript. Thus, every React component is defined with a function, function literals are written with the `=>` operator, and so on.

# Specification Language

We start with the main ideas, then proceed to details. Key concepts include 
- state
- transition
- page

State variables hold client state. Transitions represent user initiated events in the client that require a client-server interaction and may cause a new page to be drawn. Button clicks are a standard way to initiate transitions, but any event-generated callback associated with any component in one of your pages can initiate a transition. Transitions are named and you indicate causation by using a transition name as the value of some event-handling parameter of a component. Pages represent rectangular screen areas; typically multiple pages map to the same screen area, but this isn't essential.


## State

State variables hold the client state, and data flows between client and server via state variables. In the client, they are declared and managed according to React conventions. In the specification, they are declared with a statement whose form is `state <decl> , ...` where `<decl>` is either `symbol: type` or `symbol: type = initvalue`. For example, you can declare a single symbol `myState` with a statement like

    state myState: list(integer)

and this would cause webgen to generate javscript for the client like

      const [myState, setMyState] = useState([]);

Transitions may mention state symbols either for sending data to the server or for data received from the server in response to a request (or both). Symbols declared in `state` statements are not declared in the server; they may appear in the d8m code that webgen synthesizes to handle transitions. Javascript fragments embedded in callback props of components may use state symbols and/or their value setting functions (`setMyState` and the like). Component instantiations in pagespecs use state to determine their appearance, store user defined settings, and so on.

An alternate definition of the same symbol could give it an initial value. This is a javascript expression, and like most of the javascript in webgen specs, it needs to be quoted (in this case as a string). For example,

    state myState: list(integer) = "[1,6,12]"

It's also possible to declare multiple symbols with a single statement, though unlike in d8m, each declaration requires its own type and/or initial value. For example,

    state myState: list(integer), anotherSV: string

Thus, the syntax for the `<decl>` part of `state` statements is inspired by d8m but is different and simpler in several ways. We just mentioned one simplification: that in d8m a single type expression can declare a list of identifiers, which is not allowed in `state` statements. Also, types are simpler, since the type part is adapted to the needs of javascript. The only type generator is `list`, and the allowed basic types are

- string
- integer
- float
- boolean
- label
- object

The distinction of `integer` and `float` is for d8m (i.e. the server code handling transitions), since javascript doesn't distinguish integers and floats. Similarly, `label` is `string` in javascript and the distinction only matters on the server side. The provision of `object` allows you to declare state symbols that are dynamically typed, lists whose elements have diverse types, etc. You'll have to arrange to read these into the proper type in the server code -- you cannot send things with `object` as the basic (leaf) type to the server in a transition, though you can send them the other way.

Javascript has "objects" whose behavior somewhat resembles d8m's tuples. These can be a useful structuring mechanism for data whose organization is sufficiently complex. Therefore, you can define and use object types in webgen specifications. You do this with an `object` statement (which is actually unrelated to the just discussed use of the same word as a basic type):

    object ObjectT = {
        firstProp: string
        secondProp: list(float)
        thirdProp: list(list(integer))
    }

After this statement, `ObjectT` can play the role of a basic type in any `state` statement. So you can write

    state anObj: ObjectT
    state aList: list(ObjectT)

and so on. There is no option for object literals in types &mdash; `list` remains the only type operator. Nor should these types be recursive.

Concretely, the `object` statement does two things. It generates the obvious d8m type in the server code, as long as none of the attributes use `object` in their type descriptors. And assuming you use instances of these "objects" in the javascript you write for the front end, it documents what you expect these objects to look like. For example, given the above `object` and `state` statements, your javascript might say `anObj.firstProp` somewhere and it would be documented that this should be a string.

However, as you know, javascript is dynamically typed. Using an object statement doesn't change that. Nothing is checked or ensured. It works just as well to define your objects with d8m types and use them in your javascript in just the same way. Doing so allows you the full power of d8m types (e.g. with methods) whereas d8m types created from object statements are only tuple types.

Although the webgen translator does no typechecking of your javascript, it can help you obey the conventions React wants for updating list-valued symbols. Specifically React wants you to avoid modifying elements of stateful lists in React and instead to copy the list, modify it, and call the `set` function on it. Webgen helps you with this pattern by synthesizing functions to do it for state variables that modify an element. Given a state variable declared as

    state statevar: list(string)

webgen will create a declaration as stated earlier:

    const [statevar, setStatevar] = useState([]);

In addition, given that the declared type is `list`, it will generate a function to set the `i`th element with the conventions React wants: `setStatevarAt` takes a value and an index and updates the `statevar` state variable at the given index by copy, modification, and `setStatevar`. For example:

    setStatevarAt("new string", 12)

## Transitions

A `transition` statement defines a client-server interaction, and may change the active page on the client. To do these things, the statement must define how the client request to the server is structured, what to do in the server, what response to send, and whether to change the active page. Syntactically, it consists of the `transition` keyword followed by an identifier to name the transition and several clauses that cover these requirements. The first item after the identifier is a string literal that we're going to call the _route_. More formally, it's the `path` part of the URL to be generated for the server request, without slashes on the ends. For example, a transition statement could start as

    transition openFile "openfile" ...

This transition is named `openFile` and the client initiates it by an HTTP request to `<server>/openfile/...` where `...` encodes the request parameters.

We call this the route because that's the term most web servers use for this part of the URLs they process. As usual, you can use any naming scheme you find convenient for these routes, and they can include slashes internally.

The next item defines the HTTP method and request parameters. Currently supported methods are GET and POST; the item is written like a function call to one of these methods. The arguments to this "function call" are request parameters (for GET) or items within the json object sent in a POST. These are given as a comma-separated list of either identifiers declared as state variables or bdgpts (of the form `identifier:type`); the latter represent values received from the javascript function handling the event that's bound to the transition.

For example, imagine there's a textarea in some part of your interaction design, and you want a transition to save the text into a file. You might define a transition like

    transition saveFile "save" POST(filename: string, textareaContents) ...

This declaration makes sense if the transition is bound to a submitter (for example, a button) in a component whose state also includes a filename provided by the user. The `filename: string` part of the transition definition means we expect the component's event handler function to have a `string` argument we can interpret as the filename. We further assume that the specification includes a state declaration

    state textareaContents: string

and that the Textarea component uses `textareaContents` for its state, i.e., that its `onChange` prop calls `setTextareaContents`. The handler that invokes the transition (for example the `onblur` handler) provides a `filename:string` argument to the transition. In this case, webgen synthesizes javascript for the transition that assembles the filename (in a prop named `filename`) and the textareaContents (in a prop named `textareaContents`) into a json string sent to the server. In other words the server gets an object of the form `{filename: string, textareaContents: string}`.

The request part of a transition statement can also support propagation of state between nested React components; this is a recommended pattern for using React components. Specifically, a component `C0` may define some state that's needed by another component `C1`. Let's say `C0` calls it `X` and `C1` calls it `Y`. React wants components to be modular and this means that the definition of `C0` shouldn't directly modify `Y`. Instead, arrangements should be made to copy `C0`'s value of `X` to the more globally defined `Y`. In order to facilitate this pattern, webgen makes the following rule. Suppose that you're defining a transition `MyTrans` and you expect that the submitter that triggers it provides some state that needs to update a state variable `myState`. We've already said that when the submitter provides an argument, the request part of the transition statement should define this with a bdgpt: an identifier : type expression. In order to get the desired copying of this value, give it the name of the state variable, for example:

    GET(myState: list(integer), ...)

Since `myState` is the name of a state variable, this sets the value of `myState` to the submitter function's first argument and then provides that value to the server in the GET request.

Webgen synthesizes a javascript function for each transition whose name is that of the transition. This makes it easy to interpose extra code between the event handler and the call to the server, should you need to do so. For example, given a transition named `transn0`, instead of writing `clickfn~"transn0"` in the component generating the transition, you can define a javascript function `transn0Prep` that does whatever you need then calls `transn0(...)`; now write `clickfn~"transn0Prep"` in the component.

The next item in a transition statement gives the name of a d8m function that handles the transition on the server side. This is part of the glue code you need to write to make your app work. Before we get into the details, let's cover some background. We'll call this function the `action function` for the transition. We can think of it as having three parts:

1. collect arguments coming from the client
2. use the arguments to properly interact with the code or data in the app that this transition affects or accesses
3. format and return the result, if any.

The result is always json coded; the incoming arguments will be json coded if the HTML method is POST, and URL parameters if it is GET. Your original app likely involves some kinds of state, but the interactive extension you're now building will certainly involve additional state. You should plan to organize this interaction-specific state into a type called `runstateT`. And you should almost certainly organize your action functions as methods of this type. (They don't have to be &mdash; they can be mod functions of it. But usually, methods are more convenient.)

We assume in the following that you use the standard json module to decode and encode json.

Alright then. The syntax for naming the action function in a transition is `then fnname` to suggest that upon receiving a request, `fnname` is called. It takes appropriate actions and formulates a response whose type, `actionfnRettype`, will be described momentarily. It will almost certainly want to modify `runstateT`, so it'll be a mod function or method. There may be other arguments in its signature, depending on the HTML method.

If the transition uses POST, the request data are json coded. In this case, the _undecoded_ request body is passed to the action function. So the signature of POST-based action functions is always

    \mod(runstateT, list(byte)) -> actionfnRettype

In the following we'll assume there is a global state variable named `runstate` with type `runstateT`. For POST requests, the json string encodes a javascript object whose properties match the arguments given in the spec. For the example given above of a transition named `saveFile`, these are `filename: string` and `textareaContents: string`, in that order. To read these arguments, the action function should define a tuple type with these attributes, that is `tuple(filename, textareaContents: string)`. A call to the `fromJson` method on a jsonStream (from the `json` module) will initialize a local symbol with the arguments. (One can also decode the json stream with lower level code and get more flexible results. See documentation on the json module for details.)

For a GET request, the webgen translator synthesizes server side code to get the request arguments then call the action function with the supplied runstate and those arguments, in the order declared. Consider a transition like

    transition usingGet "myGetter" GET(arg1: integer, statevar3, statevar6) then action1 ...

For this example, we assume that a submitter prop of some component is invoked with `usingGet` and that this prop invokes a function with a single integer argument. That argument will get bound to a request parameter named `arg1`, and the values of the two listed state variables will get bound to other request parameters named `statevar3` and `statevar6`. On the server side, a function must be defined with the following name and signature:

    action1: \mod(runstateT, integer, T1, T2) -> actionfnRettype

where `T1` and `T2` are the declared types of `statevar3` and `statevar6`. So webgen will synthesize a handler for `myGetter` that calls this function:

    action1(runstate, A, B, C)

where the arguments after `runstate` are the parameters of the GET request converted to their declared types. The translator also generates code to convert its return value to the correct type, and sends it back to the client.

The action function receives the client's arguments, carries out the required action, and delivers a response. We've already seen that the way it receives the arguments differs depending on the request type, GET or POST.

Before getting into the details of how responses are delivered to the client, we need to discuss the response part of the transition statement. This part of the statement is optional: the server always sends a response but it can be empty. To get an empty response, omit the response part of the statement. Otherwise, the response part starts with the word `response`. Abstractly, the response part of the transition statement consists of zero or more _options_, each of which can update the active page, update some client side state variables, and perform a "hook" action. (Note: this use of the term "hook" is completely independent of hooks in React.) Zero options corresponds to omitting the response part of the transition, as mentioned above. Multiple response options are combined with `or` in the syntax as shown below. Defining multiple response options is the general purpose way to make the outcome of the transition depend on what happens in the server. Thus, anything more complicated than a simple error should use this approach. Syntactically, the response part of the transition statement looks like one of the following

    transition trans1 "path" <getpost> then action1
    transition ... response option1
    transition ... response option1 or option2

The three transitions shown have zero, one, and two response options. (Formally, an indefinite number of options is allowed.) The synthesized client code decides which of multiple options is selected by using the value of the first state variable specified in the set. We'll give an example later. We turn next to how response options look.

Each response option tells the client how to change a subset of the state variables and optionally, to change the active page and/or perform some "hook" action. Specifying the state variables part amounts to writing down the subset you want. Webgen uses standard set notation for this: a list of symbols in curly braces. For example

    {statevar3, statevar6}

says to update two state variables. We call this a _response literal_. It's possible to name such response literals; we call these _response objects_ and define them with a separate statement:

    response aResponse {statevar3, statevar6}

causes `aResponse` to mean the same thing as the response literal. Webgen will check that `statevar3` and `statevar6` are declared as state variables. The main reason to use a response object is when multiple transitions update the same set of state variables; using the response object makes your code clearer, by showing the reuse. An additional convenience is that webgen synthesizes a json encoder for response objects in the server, which saves some coding on the server side of the spec. Details below.

A response option that sets a page is written in parentheses with a page name followed by comma and the other part(s) of the response option. For example,

    (nextPage, aResponse)

says to update the state correponding to the response object `aResponse` and go to `nextPage`.

There are cases where you need the client side response to include actions other than updating a given set of state variables. For example, `statevar7` needs to be updated by a javascript function depending on the new value of `statevar6`. You do this by defining the javascript function in a `javascript` fragment of your spec and calling it in the response option with the following syntax:

    aResponse+update7(statevar6)

For example, the response part of a transition might be

    response (nextPage, aReponse + update7(statevar6))

This response does everything: changes the active page to `nextPage`, returns some data, and calls a hook function. The returned data is in `aResponse`, which we assume is the response object defined in an earlier example. The hook function is `update7`. Hook function calls may only have arguments that are part of the response, which implies they're state variables. And hook functions are javascript functions that you've defined somewhere else. The call to `update7` synthesized in the client for this transition passes properties in the response as arguments, not the state variables they'll modify, since React saves modifications for later.

We extend the hook expression to handle the case where an error in the server requires the client to change state in some way (such as to back out of a multi-step process because of the error). If the response data part consists of the word "error" then the hook expression is called on any error, before the error message popup is displayed. If there's a normal response and an error hook, use the multi-option syntax (with "or") to encode both.

Webgen synthesizes a client side function for each transition; this function sends a request, then handles the response and any errors. We cover next a few of the details that we've glossed over so far. We stated earlier that in the server, the return type of an action function is `actionfnRettype`. Informally, this tuple allows the action function to send a normal response plus the selected index among response options, _or_ an error message. Formally, we define the type as follows:

    tuple(err: string, respinx: integer, response: string)

One of `err` or `response` should be the empty string (for a good response, or error response, respectively). The `respinx` is ignored for an error response or a good response in a transition that has a single response option. For a multiple option response, respinx should be the index of the actual response, numbered from zero. The synthesized client code for the transition uses respinx in this case to decide how to decode the response, which state variable to assign to, etc. The client behavior when the `err` attribute of the `actionfnRettype` is non-empty is to display the message in a dismissable popup window. In the normal case, the `response` attribute should be a json encoded string.

The server side handler generated for a transition by the webgen translator encodes the `actionfnRettype` in json and sends it to the client. The generated client code decodes that response, updates the appropriate state symbols, and calls the hook expression if one is given. There is code that checks for an error response and displays the popup window; no other state changes occur in this case. Again, handle simple error cases with the `err` side of `actionfnRettype` and handle anything more complicated with multiple response options. (By the way, the error popup window is generally available for use in client code: call `setErrorMessage` with a non-empty string at any time to make the popup visible; dismissing it clears the `errorMessage` which is always defined by webgen in the synthesized client.)

We mentioned earlier that response objects have a convenience function to encode json (on the server side). Its name is always the name of the response object concatenated with `Encoder`. For example, consider a response object `RespObj` declared as `{A, B, C}` where the state declarations are `A:T1`, `B:T2`, `C:T3`. There's a caveat: all the state variables in the response object must have non-recursive d8m types whose leaf types are integer, float, string, or label. So, if `T1`, `T2`, and `T3` meet these restrictions then the `RespObjEncoder` function is defined with signature

    \(A:T1, B:T2, C:T3) -> list(byte)

If the action function wants to return values `a`, `b`, and `c` for the corresponding state variables, it can call `RespObjEncoder(a, b, c)` to get the json string.

An earlier example was a transition named "usingGet". Let's consider a few responses for this one.

    transition usingGet "myGetter" GET(arg1: integer, statevar3, statevar6) then action1 response {statevar3, statevar6}

Since we used a response literal, `action1` handles the json encoding itself, returning an `actionfnRettype` whose `response` attribute would contain that json string. Another possibility is

    response aResponse {statevar3, statevar6}
    transition usingGet "myGetter" GET(arg1:integer, statevar3, statevar6) then action1 response aResponse

In this case, `action` can call `aResponseEncoder` to get the json string. If the transition changes the active page, change the spec to

    transition usingGet "myGetter" GET(arg1:integer, statevar3, statevar6) then action1 response (otherPage, aResponse)

To get custom things to happen in the client, use the hook feature, as in

    transition usingGet "myGetter" GET(arg1:integer, statevar3, statevar6) then action1
        response (otherPage, aResponse + update7(statevar6))

Finally, let's consider how we handle a server response that elicits different options for the client. For example

    transition usingGet "myGetter" GET(arg1:integer, statevar3, statevar6) then action1
        response (page1, {statevar3, statevar6}) or (page2, {statevar2, statevar9, statevar11})

Since this has two response options, the action function, `action1`, must set the `respinx` of the `actionfnRettype` it returns to either 0 or 1, for the first or second option. If it sets `respinx` to 0, it should set the `response` slot to a json encoding of `{statevar3, statevar6}`, whereas if `respinx` is 1, then `response` must be a json encoding of `{statevar2, statevar9, statevar11}`.

We summarize the full syntax of the `transition` statement with pseudo-BNF (using `{}` for optional, `|` for alternative, and parens for grouping):

    respOptionBase ::= <ident> | <resplit>
    respOption ::= respOptionBase { "+" <funcall> }
    responsePart ::= <respOption> | "(" <ident> "," <respOption> ")" { "or" <responsePart> }
    param ::= <ident> { ":" <typeexpr> }
    params ::= param { "," params }
    "transition" <ident> <string> (GET|POST) "(" { params } ")" "then" <ident> { "response" <responsePart> }

The undefined `<typeexpr>` in the `<param>` rule means simplified type expressions consisting of symbols optionally enclosed in `list(...)`.

## Pages

Pages are mainly constructed by instantiating React components, so this is where the use of React is most visible. Before getting into the details, let's step back and reflect for a moment on what we mean by "page". The original/traditional web serving model embodied in the HTTP and HTML protocols has each client request loading a new page which defines the entire screen. The performance issues with this approach were appreciated very quickly in the history of web technology. Alternatives generally use the protocol known as XHR to make DOM update incremental. React does this and more, so in traditional terms a React-based website is a single-page website because essentially every interaction after the initial page load is incremental using XHR. Consequently, the original meaning of "page" is outdated. We use the term to mean a way of using a rectangular part of the screen; usually, some other page uses the same screen area differently, although this is not strictly required. For example, if the top and bottom of your screen always contain "header" and "footer" graphics, then most of your pages represent different ways of using the remainder of the screen. You can define the "header" and "footer" as pages or as part of the initial page.

The `pagespec` statement tells how to render a page; its form is

    pagespec pagename expression

so it associates the `pagename` identifier with the given expression. The expression instantiates a webgen component, which normally instantiates other components in its arguments. Clearly, the complexity of pagespcs resides not in the syntax of this statement form but in the meaning of "webgen component" and its instantiation. Therefore, our main task in this section is to describe webgen components: their relationship to React components and their syntax in the webgen specification language. We start with syntax. Arguments ("props") are written in parentheses, usually but not always keyword-tagged. If children are present, they're in curly braces following the arguments. Thus:

    Comp(arg1, tag2~arg2, tag3~arg3) { child1; child2; ... }

where newlines can replace the semicolons between the children and the commas are optional. We'll follow React terminology in calling the arguments "props". Whereas in JSX you bind prop names to values with `=`, pagespec expressions use `~`. The example shows `arg1` without a tag plus two more arguments with tags. Stylistically, my preference is to use untagged arguments only in components with one or two props, so combining tagged and untagged is discouraged, but allowed.

A component instantiation _may not_ omit the parentheses if no props are set but _must_ omit the curly braces if no children are present. Commas between props are optional, so another way to write the above example would be

    Comp(arg1 tag2~arg2 tag3~arg3) { child1; child2; ... }

Webgen components are React components whose definition includes a description of their props in a certain format that the webgen translator can read. Details are in the next section. Component names must be capitalized &mdash; this is a React convention.

In the section on [Transitions](#Transitions), we described how a transition can change the active page. Here, we cover more completely the topic of changing pages. There is a special builtin "component" named `Insert`. It has a list of untagged arguments which should be the names of pages, and an optional condition in the "children" telling how to select them. This allows your interaction design to define one or more spots where page changes happen and to cause page changes either via transitions or programmatically.

Each place in a pagespec where `Insert` is instantiated designates a screen area that gets drawn differently depending on the page that's active in it. Normally, there is just one such place. In the simplest layout, there is no explicit Insert statement at all. In this case, webgen creates an initial page consisting of just an `Insert` statement with all the defined pages listed as children in order of definition and no condition. In this case, the transitions must specify page changes. In a slightly more complicated case, you want a layout with some fixed parts (such as a header and/or footer) and some variable parts, represented by the pages. To do this, define a page named `initialPage` and create an `Insert` statement for the variable part. In this case, the page changes can be handled with a javascript condition or via transitions. For example, suppose you have 3 pages that vary programmatically beneath a header part. Define a pagespec like

    pagespec initialPage Div(class~"topclass") {
        Div(class~"header") { ... }
        Insert(page1, page2, page3) { "cond > 3 ? 0 : 1+pgindex" }
    }

The name `initialPage` ensures that this page gets drawn at the top level. The javascript expression in the curly braces must be quoted, like all javascript expressions, and should designate an integer between 0 and 2, since there are 3 pages in the list. So in this case we assume pgindex is 0 or 1. In the same situation where the pages are linked to transitions, omit the curly braces in the `Insert` statement and add mentions of the pages to the transitions.

Transition-based page changes work by defining a state variable for each Insert: `pgcount0` for the first, and incrementing from there. (Note: as a result of this, webgen reserves all identifiers starting with `pgcount` as state variable identifiers.) The javascript code synthesized for transitions includes code that sets the appropriate `pgcount#` state variable and the code at the `Insert` is equivalent to indexing the pages by the value of this variable or by the value in the expression supplied with `Insert`. You can use this information to do page manipulation in your own custom javascript code.

### Built In Components and Conventions

There is a small set of "universal" props that are allowed in every webgen component, in addition to the props declared in the component definition. These must be tagged when used in instantiations. Formally, they are all optional. Currently, the universal props are `class`, `width`, and `height`. The `class` prop translates to `className` in JSX and then back to `class` in html. The argument to `class` is an identifier; details about its use are given shortly. The `width` and `height` props translate to the corresponding css properties and take arguments appropriate for those properties. They have their standard meaning in html/css.

A set of built in webgen components resides in javascript files in a directory known to the webgen translator. User defined components can be added by writing a `components` statement in a specification identifying a directory where additional ("user defined") components are found. Certain components are predefined that correspond directly to html tags. These include `Div`, `Span`, and `H1` through `H6`. All of these accept children. The `H1` through `H6` components also accept an optional prop named `label:string` which can be used instead of children. This allows you to write H1 (and friends) with an argument in the typical case -- `H1("My Heading")` -- while preserving the option to use the `{...}` syntax for headings that need to embed other component instantiations. (Formally, one of `label` and `children` should be present with `label` taking precedence.)

There are a few more "deeply built in" component-like items. `HListView` and `VListView` provide a way to create visual lists laid out either horizontally (`H`) or vertically (`V`). Elements of a `HListView` are perceptually columns laid out left to right, while `VListView` elements are rows laid out vertically. The standard `Div` and `Span` "components" do something similar by default but the `ListView` components provide a way to map a data list into visual elements using syntax borrowed from d8m. For example, you can write

     HListView(i^K) { child1; ... }

to get a `div` with the children repeated in each of `K` columns, using flex layout, and where the symbol `i` designates the (zero-origin) index of the column when evaluating the children in each case. A convenient (and accurate) way to think about this is that the translator turns this into a `map` over the indicated range of integers (0...K) with the index variable `i` in this case. In children of ListView you can access per-column information by indexing list-valued state symbols: `foo[i]` for example. Update such information with the `setFooAt` function. The `ListView` constructs are not components and don't have props, but they accept the standard universal props after the iterator argument.

Note: The ListView "components" generate a `div` set to `display:'flex'` and with children generated by a map over the children. It is not extensively tested.

Normally, the children in component instantiations will themselves be component instantiations, but it's also possible to write plain strings. What do these mean? There's a quotation-like issue. Consider a couple of examples. First, suppose I write

    Div() { "some string" }

The logical response here is to insert "some string" into the output. Next consider:

    Div() { "generateTable(...)" }

Here, it seems likely that we should insert `{generateTable(...)}` into the output, in other words, that we should wrap it in braces so it gets evaluated.

The minimum requred response to this issue is to state how the webgen translator treats strings encountered in pagespecs where component instantiations are expected. The answer is that they are always evaluated. However, webgen specifications will be clearer if you never put strings directly into pagespecs. To make this work, webgen provides ways to label them. A built in component named `Eval` accepts a single, unlabelled argument, which should be a quoted javascript expression, and inserts it into the generated code with braces around it. Another built in component named `Text` accepts a single, unlabelled argument and inserts it verbatim. Thus, you can label either interpretation explicitly.

### Defining Your Own Components

You can define your own components, put them into directories, and get access to them with a `component` statement (described in an upcoming section).
In order to fit into webgen, React component definitions must meet certain requirements and should follow various other conventions, which we'll discuss shortly. React is designed with the idea that components can use local state to enable local functionality. Thus, it's perfectly ok for your components to include `const` statements bound to React's `useState` function. Some of the built in webgen components do this. Webgen uses standard React conventions for passing options and values set in a particular component to parent components via callbacks associated with some user action -- clicking, hovering, changing, moving the mouse away (blurring), etc. Webgen's library components attempt to promote a standard naming convention for such props as the verb followed by `fn` (function), as in `clickfn`, `changefn`, `dismissfn`, and so on. In addition, webgen provides fixed ways to handle certain things, like reporting errors to the user.

The webgen translator recognizes components as follows. Given a directory, it scans for files matching `*.js`, and in each such file it looks for a function definition meeting the following criteria:

1. function name is capitalized
2. function has single argument named `props`
3. One or more lines above the function definition have `//` style comments

Given such a pattern, the translator looks in the comment lines above the function definition for one of the phrases "accepts props" or "accepts the prop". Then it searches after the matching phrase for a sequence of `symbol: type` expressions surrounded by backticks and optionally followed by the phrase `(optional)`. When finds a dot (`.`) it stops.

In order to identify a function as a webgen component, it must find one or more such props documented in the comments.
For example, one of the files in the directory of built in webgen components is named `Button.js` and its contents are as follows:

    // Button is a very minimal wrapper for the html button element.
    // It accepts props `label: string`, `clickfn: submitter`, `disabled: boolean` (optional).
    // If present, disabled should be a boolean expr that generates true to disable the button.

    function Button(props) {
        if(props.disabled === undefined) { ... }
        ...
    }

The scanning process finds three props: `label`, `clickfn`, and `disabled` and since the function is named `Button`, that's the name of the component. Untagged arguments in instantiations map to these props in the order of definition. Since `Button` has no prop named `children` instantiations of `Button` may not use curly braces. A plausible instantiation of this component would be

    Button("Done", clickfn~doneTrans)

where `doneTrans` is the name of a transition. This button would always be enabled since the optional `disabled` prop is not provided.

By convention, the file containing this `Button` component would be named `Button.js` and would finish with the statement

    export default Button;

However, you can use different filenames, and a single js file can contain multiple component definitions using the non-default form of the javascript export statement.

Props intended to be bound to event handlers should be typed as `submitter`; it's ok to say `function` as well. The comments section should describe what arguments are passed to the function given to this prop. The webgen translator does not typecheck these arguments.

In the context of webgen components, the "type" of props is mainly for documentation and is not formally checked. However, the words `string` and `submitter` are treated specially:, see [here](#Binding-Arguments-to-Props). The translator requires all untagged arguments to occur before any tagged ones, and checks that required props are assigned and that no prop is assigned twice. It allows components whose documentation includes a prop named `children` to have children and declares an error if a component with no `children` prop is instantiated with children.

A user defined component may explicitly define any "universal" prop and such a definition overrides the standard one. For example, if a component `Comp` _requires_ the `width` prop (which is normally optional and treated as something that goes into the `style` property), it can express this by defining `width` as a prop in its documentation.

The default component library embodies a number of conventions that I wish to promote as part of "webgen style". The first is conventions for handling certain conditional patterns. In React/JSX, the code you write is javascript so you can use "the full power" of javascript, including `if` or `?:`. A `pagespec` isn't a program, so these constructs don't work there. As partial compensation, three standard components are defined that wrap their children in a span with a condition. These are called

- `IncludeIf`
- `DisplayIf`
- `VisibleIf`

All of these take a prop named `condition`, which is a boolean-valued function, and do their indicated action when the condition evaluates to true. Thus, `IncludeIf` either includes the children or generates an empty string; `DisplayIf` sets the value of the `display` style for the span either to `none` or to the value of the `other` prop, which defaults to `block`; and `VisibleIf` sets the value of the `visibility` style either to `visible` or `hidden`.

It is worth noting that standard conditional execution rules don't apply to pagespec components. For example, in javascript (or pretty much any other programming language), when an `if` statement that checks for a condition like `X !== undefined`, you can write expressions involving `X` in the then part assuming that is it not undefined. But this doesn't work with `IncludeIf` &mdash; expressions evaluated in the children of an `IncludeIf` may not assume that things checked in the "condition" of the component are true in the body. The React machinery is always going to evaluate them. A later section has a detailed example.

Another common conditional pattern is enable/disable of html input elements. The way this works is pretty badly bungled in html; React cleans it up somewhat but even so, it cannot be handled with a wrapper like the other conditional properties. Therefore, enable/disable is handled in specific components, such as `Button`.

Similarly, html has a `label` tag which is useful when associated with various input tags. A selection of the built in components for webgen include a `label` prop that can associate a label to the left or right of the control; details are in the documentation. See for example, `Checkbox` and `Textbox`. Another way to help users understand how to use interactive elements is by liberal use of the built in `Explanatory` component, which presents as a green question mark that pops up explanatory text when clicked. This can wrap one or more child components and will present next to them if so. (It can also be used standalone.)

### Binding Arguments to Props

Arguments to props in a webgen spec will commonly be strings whose content is the javascript you want in the JSX form. Before we go further on this topic, we need to clarify the rules for string literals in pagespec expressions. Both of the d8m string literal forms are accepted: backticks or double quotes indicate strings. However, the rules about interpreting the contents of strings differ from d8m. In d8m, a double quoted string interprets backslash to quote or modify the character that follows and interprets the sequence `#{...}` as embedding d8m expressions ("string interpolation"). In a pagespec, backslash works the same way in double quoted strings but string interpolation does not. String contents are then turned into javascript strings using double quote characters, adding backslash in front of any unquoted double quote characters in the string. In javascript, the moral equivalent of string interpolation is called "template strings" and is triggered in string literals wrapped in backticks. In a pagespec expression, however, a string literal surrounded by backtick characters does not become a template string in javascript. As stated earlier, the backticks are removed and double quotes are added. In fact, template strings are not possible in props values in the JSX generated from a webgen specification. The javascript statement, described in the next section, doesn't interpret string literals, so template strings in javascript statements work as expected.

To understand how strings in pagespec expressions map to javascript values in the generated JSX, consider the `Button` component described earlier. We saw that its props are `label: string`, `clickfn: submitter`, and `disabled: boolean`. When you instantiate a `Button` in a `pagespec`, the first two arguments are required, while the third is optional. The rules for interpreting values are somewhat different depending on the declared types of props; for this purpose the relevant types are `string`, `submitter`, and anything else. A prop with `submitter` type may have as value a symbol designating a transition. The translator generates a javascript function for each transition, and interprets the name of the transition in value position of a `submitter` prop as a call to that function. The translator will verify that the transition name is bound to a prop typed as `submitter` (or `function`) but it's up to the spec writer to ensure that the prop's signature matches what the transition function expects.

Props with `string` type raise a problem about quotation: the value is a string, but are its contents literally the desired value or javascript that generates the desired value? If I write `Button(label~"Save", clickfn~SaveTransition)` it's pretty clear to any programmer what the `label` prop's value means, and similarly if I write `Button(label~"cond ? 'L1' : 'L2'", ...)`. But the translator needs rules. The rule we adopt is that string-valued arguments are normally interpreted as literals (as with `"Save"`); if you want them to be interpreted as javascript, write them as a new style function literal with no arguments. So the second example will be correctly interpreted if written as

    Button(label~"() => cond ? 'L1' : 'L2'", ...)

Props with any type except `submitter` or `string` are always treated as javascript when bound to strings: the contents of the string go into the synthesized JSX with `{...}` around them.

The universal prop `class` gets slightly special treatment since webgen doesn't allow its bindings to be computed. You can present either a string or an identifier; identifiers will be quoted. To present multiple classes, use the string form. Thus, `Comp(class~MyCompClass, ...)` ends up treated the same as `Comp(class~"MyCompClass", ...)`.

### Defining and Including Components

The built in components library is known to webgen; the components in it are automatically available. Two statements called `components` and `source` let you define additional components and control their inclusion in your output. The `components` statement can take two forms: one to identify directories of components and one to state that certain already known components are used, even if this isn't obvious in the spec. The first form is

    components path

where `path` should be a string literal, using double quote characters that gives a directory path. The named directory should be a "components directory". This means it contains javascript files (with `.js` extensions) containing components and a file named `All.css` that has css for them. After processing such a components statement, the components in the directory are available in any `pagespec` statement in the specification. Webgen reads `.js` files in the directory and scans each such file for function definitions preceded by `//` style comments, as described in the [pagespec](#pagespec) section. It also reads `All.css` and associates any css directions therein with each component. Details on how to organize `All.css` files are in the [Styling][#styling] section.

The second form of the `components` statement is

    components identlist

where `identlist` is a comma-separated list of identifiers. These are taken to be names of components that are used and should therefore be imported. This lets webgen generate the right imports when you mention one or more components in javascript strings but not directly in pagespecs. (Webgen doesn't parse included javascript, so it won't see components used there.) Components appearing in the usual way in a pagespec don't need to be declared this way, though there's no harm in doing so.

There will be times when npm packages define components you want to use. For these cases, we need a way to describe their props in webgen terms, reproducing essentially what's in the comments in a locally defined webgen component. You do this with a `source` statement. It links to a source of components. This has 3 parts separated by `/`: a path to the npm package, the props descriptions, and a list of component names from the named package that share the given props. For example, you might want to use some icons from the react bindings of the feather icons. You could write

    source "react-feather" / color:string, size:integer / ArrowLeft, ArrowRight

After this statement, components named `ArrowLeft` and `ArrowRight` are available; if either is used directly in a pagespec, the generated App.js will include an import statement to get those items from the react-feather package. Both are treated as having two optional props named color and size. Note that if these icons are used in a way that is "hidden" from pagespec, such as in a javascript call, you must **also** list them in a `components` statement, as discussed earlier.

The props descriptions in the `source` statement have an optional "binding"; if present this must be either "required" or "optional". Optional is the default, so a required property would be defined as

    propname: proptype = required

(These words should be symbols, not string literals, in other words, no quotes please.)

Note that if a spec uses some named package, like "react-feather", in a `source` statement, you're responsible for ensuring that the package is installed in the node_modules area where you put the compiled files.

## Including Javascript, CSS, and HTML

So far, we have described the statements you use to define the major webgen abstractions: state, transition, and page. Here, we describe statements for inserting your own client side code. First, the `javascript` and `css` statements allow you to define javascript and css, respectively, that will go directly into the corresponding output file. Specifically,

    javascript { ...js defns... }

causes the text enclosed in balanced curly braces to be inserted verbatim into the generated App.js file. When you need extra functions to manage your state variables properly, these can be defined in `javascript` statements. A specification may contain multiple `javascript` statements, the translator writes them into the output file in the order of occurrence in the specification.

The `css` statement is basically the same idea, but applied to generating an `App.css` file for the client code. The definitions in a `css` statement would typically address styling requirements specific to the app being specified, that modify or extend definitions associated with components. Details of how webgen supports styling are in an upcoming section.

Both the `javascript` and `css` statements have file reading variants: a filename written as a string literal causes the associated file to be read and included in the appropriate output instead of text enclosed in curly braces. So

    javascript "definitions.js"

inserts the contents of the file named "definitions.js".

You'll include javascript to support interactions that aren't encapsulated directly in components, and css to style your pages. Therefore, the statements just described will normally appear in every webgen specification file. A somewhat less common requirement is to include static html. This is harder to do in React than it should be, partly because React is very javascript oriented, but mainly because loading static html files in browsers is not all that easy, in part because of security issues. Including html can be dangerous because of a security issue known as XSS (cross site scripting). Webgen provides a way to include html files; it doesn't do anything to prevent XSS attacks, so you need to make sure that the html files you include are sanitized. (This isn't an issue if you use webgen output in the intended way, only with localhost and without internet access, since XSS attacks are not possible.) The statement

    html vblname = "filespec"

causes the generated App.js file to include a javascript symbol `vblname`, defined as a list of strings which are the contents of the file or files matching filespec. The `filespec` is essentially a filename, but with a number of options. If it contains the `*` character, it's treated as a pattern, so it's "globbed" into a list of filenames, which are then processed. These files can have two different extensions: `.html` and `.md`. Files with the `.md` extension are run through **pandoc** with the **gfm** flag to generate html, while html files are simply read. If the filespec doesn't involve globbing, the html stream is split on occurrences of the `<hr />` pattern. Thus, you can generate a **list** of html fragments from a single file (either markdown or html) by separating the fragments with the **hr** directive.

## Getting Started

As mentioned in the [Transitions](#transitions) section, the spec must define a type named `runstateT` whose attributes contain the state needed to run the app and allow it to interact with the client. The action functions mentioned in transitions may or may not be `runstateT` methods but they must have `runstateT` as the receiver type, and will typically be mod functions (or methods) of it.

The role of a page named `initialPage` was covered earlier, along with the rules for synthesizing an `Insert` statement if no such page is defined.

You may need for the client to run some code when your app starts up. Normally, you do this in React with `useEffect`, which you can program into the components you define, but since webgen is handling synthesis of the top level component for you, that doesn't work in this situation. Accordingly, if you define a transition named `onLoad` it will be run once when the client is first loaded.

## Styling

An earlier section described the `css` statement, which allows you to define any css definitions that apply generally to the application. The `All.css` files in each components directory provide a way to define default styling for components. Each such file consists of a list of css definitions; css files allow for comments using the `/*...*/` convention. Identify the definitions associated with a component named `Comp` by writing a comment that says `component Comp`. To simplify pattern matching, this comment must have single spaces between the comment text and the comment delimiters. Thus

    /* component Comp */

tells where css definitions for `Comp` start; they continue until the next such comment or end of file.

If `Comp` is used in a webgen specification, these css definitions will be copied into the generated `App.css` file.

The same conventions apply to the more "official" definitions in the default/built in components directory. You may not be able to modify these. To override such definitions, repeat them in your preferred form in a `css {...}` statement within your specification. The definitions in these statements go into the generated `App.css` file _after_ those coming from components directories, so these will override the built in ones.

### Ordering Requirements

There's some flexibility in the order you define various parts of a webgen spec, but also some constraints. State symbols should be declared first, since they must be declared before use in response statements. Response symbols should be defined before use in transition statements. Pagespec symbols and transition symbols may be used before being defined. Other statement types ( components, initial, javascript, css) may occur anywhere. A webgen specification document also includes d8m code, which is passed through to the generated server file. It is surely a good practice to segregate most or all of this in one part of the spec file, but technically, this code can occur anywhere.

# Using Webgen

The webgen program has one argument &mdash; the specification file, and several optional flags:
- `-client=path` defaults to `src`; defines the target directory for client files (including `App.js` and `App.css`). 
- `-port=number` defaults to `8080`; the server uses this localhost port
- `-deploy` defaults to the empty string; see below

The expectation is that you use `create-react-app` for the develop/debug phase of your interactive app. If you put the specification file in the top level of the directory tree for this environment, the default value of the `client` flag is what you want. For example

    npx create-react-app appOne
    # install needed additional react libraries (see text)
    cd appOne
    touch appOneSpec.d8m        // edit spec here
    ...
    webgen -port=8090 appOneSpec.d8m
    d8mc appOneSpecSrvrPort8090.d8m
    npm start &
    ./appOneSpecSrvrPort8090 ...

This shows the sequence of commands from creating to running in debug mode. In this case, we've decided to use port 8090. The name of the server file that webgen synthesizes is derived from the name of the spec file, `"SrvrPort"`, and the port number. 

The above code shows that in order to run the app in debug mode you run _two_ processes: `npm start` and the server generated by webgen. These use distinct ports. Npm start defaults to 3000. 

There's a comment in the above commands about installing additional react libraries. At minimum, you need to install `react-axios`, as webgen depends on it. If you use `recharts` (a dependency of the built in `RechartsWrapper0` component) you'll also need to install that. 

When you are ready to deploy `appOne`, you run build and re-run webgen with the `-deploy` option:

    cd appOne
    npx run build
    webgen -port=8090 -deploy="/xxx/yyy" appOneSpec.d8m
    d8mc appOneSpecSrvrPort8090.d8m
    mv appOneSpecSrvrPort8090 build/
The deploy option to webgen bundles a static server into the synthesized server in addition to the code that handles routes arising from transitions. Thus, the server will serve both client code _and_ "backend" code. Now you're using a single port, 8090 in this case. To make this work, the argument to deploy should be a full pathname to the build directory created by running `npm run build`. 

Note that for a webgen app "deploy" means to make it convenient to run on localhost. Deploying an app as a public website is more complicated and is beyond the scope of this document. The deployed app consists of the react-generated contents in `build/` plus the server executable. 

A small caveat: since react builds the client javascript files into `build/static` you should avoid using `static` as a route prefix in transitions. And a small note about security: because using two ports in debug mode triggers CORS restrictions, the generated server code in the debug version adds security-compromising declarations into the http headers going between browser and server. These are omitted in the deployed version. While debugging, it is probably best to disallow the server from accepting outside connections. Since the deployed version of the server doesn't bypass CORS and only accepts a single localhost port, it shouldn't matter. 

The server file consists of the d8m part of your spec file with the glue code you wrote, plus some code synthesized by Webgen to set up the http listener. The `runstateT` type was mentioned in the [getting started](#getting-started) section. We'll assume it's a tuple type. If there's a `runstateT` method named `commandLine`:

    method commandLine = \mod() -> nothing { ... }

then webgen will ensure that it's called when the server starts. If you want the server to use command line flags and arguments, you should define this method, have it call `flag.Parse()`, and go from there.

Normally, `runstateT` will also define methods corresponding to each actionfn mentioned in a transition. As we stated earlier, each action function has `runstateT` as its receiver. Beside the type, the glue code part of the spec must provide a runstateT entity named `progstate`. The code synthesized by webgen for transitions will call the appropriate action function with `progstate` and any arguments dictated by the transition as described [above](#transitions).

## Using React

React is an opinionated framework. One thing you need to be careful about is setting state variables. Webgen `state` statements define the variables that React defines with its `useState` primitive. You can can change these in event handlers, transitions, and so on, but not while rendering. Thus, it's important to ensure that you don't invoke code directly in rendering that will call a `set` function for any state variable. Also, React's rendering pass evaluates everything, even stuff you're not going to see. One of the provided components is `IncludeIf`, which essentially wraps a javascript `if` statement but unlike in a javascript interpreter, you cannot use `IncludeIf` to "guard" against evaluating illegal expressions in the body. For example, consider

    <IncludeIf "foo !== null" >
        ...body material...
    </IncludeIf>

You may include some javascript in the body material but if you do, it may not assume that `foo` is not null.

There's another problem with the example just given. The first prop to `IncludeIf` is a condition and must be a function. The above is not a function. Instead, you must write

    <IncludeIf "() => foo !== null" >
        ...body material...
    </IncludeIf>

When your UI design includes non-trivial "subpanels" with their own state, it can be tempting to write a javascript function with local variables bound to React's `useState` function. This doesn't work. Instead, you must "promote" the function to be a Component: move it to its own file (typically in a components directory local to the source code for your specification), define its props and other requirements for making your own components, and in the main body of your spec, invoke it as a component instead of calling it as a function.
