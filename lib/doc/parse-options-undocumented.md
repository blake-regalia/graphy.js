
<a name="option-async" />
##### Option: async
Only applies when input is a string (does nothing when using streams as input). If value is truthy, makes the operation asynchronous (i.e., the `end` callback will fire *after* the current event loop instead of before). This also clears the call stack which is a good idea if the input is a large string and `end` makes a lot of nested function calls and might overflow the stack.
