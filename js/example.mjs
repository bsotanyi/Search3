// Example code for a custom problem
// Don't touch the main variable name.

var custom_problem = {
    title: 'Custom Problem',
    // required - an object or array representing the starting position
    start: {
        x: 0,
    },
    // required - an object or array representing the finish position
    // Data structure should be identical to start position.
    finish: {
        x: 4
    },
    // required - function that returns a true or false value, based on an arbitary state
    check(data) {
        if (data.x > 4) {
          return false;
        }
        return true;
    },
    // required - based on a state, generate all possible next steps, both valid and invalid
    getChildrenData(data) {
        var children = [];
        children.push({...data, x: data.x + 1});
        children.push({...data, x: data.x + 2});
        return children;
    }
};