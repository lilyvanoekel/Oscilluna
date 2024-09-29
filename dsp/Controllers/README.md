# Oscilluna: Controllers

Controllers wrap one or more other processors, such as a chorus, phaser or collection of filters, and manage their inputs and outputs. The main use of this is so that processors can be routed dynamically, meaning you can bypass an effect, or change the order in which filters are applied, for example.

The reason these controllers exist is because at the time of writing Cmajor does not seem to support routing in graphs. This is a planned feature so by the time you read this, the approach used here might be outdated.
