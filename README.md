#WASP
##Web Audio Signal Processor

This is a fun little web audio api playground.

##What's Next

WASP is changing! This version is no longer maintained for several reasons:

### It is not well written.

This basicaly my first project and,
while I'm proud of accomplishing something as large and complex as this with almost zero experience,
it's a mess of jQuery and overly-specific functions. It is easier to restart than refactor.

### Limitations of the Web Audio API

The Web Audio API is great but it does not allow you to query its node graph for connections.
The implementation here has each GUI window keeping track of its connections.
It is solid here, but it causes difficulties if I were to add, say, another interface.

It also doesn't have any way of using 'control' signals a la Max/MSP.
These are extremely useful and very important to me to integrate.

### Bigger Plans

My envisioning of WASP would be to support custom nodes made of many Web Audio API nodes,
with only certain inputs and outputs exposed, as well as the ability to build them.

I also want to support saving, loading, and exporting to pure JS.

##So... What's Next, Then?

RL.js is the next step. It is the model that will power the next incarnation of the GUI.
It is currently only usable through javascript, though
and only has 2 advantages over the vanilla Web Audio API:
Persistent undo and a navigable tree of audio nodes.
Control signals and custom nodes are coming soon, though.
