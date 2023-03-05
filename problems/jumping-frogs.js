problems.push({
    title: 'Jumping frogs',
    input_vars: {
        left_frogs: 2,
        right_frogs: 2,
        max_jump_length: 2,
        empty_spaces: 1
    },
    get start() {
        return [
            ...Array(this.input_vars.left_frogs).fill(1),
            ...Array(this.input_vars.empty_spaces).fill(0),
            ...Array(this.input_vars.right_frogs).fill(-1),
        ];
    },
    get finish() {
        return [
            ...Array(this.input_vars.right_frogs).fill(-1),
            ...Array(this.input_vars.empty_spaces).fill(0),
            ...Array(this.input_vars.left_frogs).fill(1),
        ];
    },
    check(data) {
        return true;
    },
    getChildrenData(state) {
        let children = [];
    
        for (let index = 0; index < state.data.length; index++) {
            if (!state.data[index]) continue;

            for (let jump_length = 1; jump_length <= this.input_vars.max_jump_length; jump_length++) {
                let dest = index + jump_length * state.data[index];

                if (state.data[dest] !== undefined && !state.data[dest]) {
                    let child = [...state.data];
                    child[dest] = child[index];
                    child[index] = 0;
                    children.push(child)
                }
            }
        }
    
        return children;
    },
    customEcho (state) {
        let style = state.valid ? 'good' : 'bad';
        let append = '';
        if (state.valid && (compare(state.data, this.start) || compare(state.data, this.finish))) {
            style = 'important';
            if (state.steps > 0) {
                append = '|' + state.steps + ' steps';
            }
        }
        modifier = `<${style}table id=${state.id}>`;
        return '[' + modifier + state.data.map(frog => (
            ({
                1: '►',
                0: '🞎',
                '-1': '◄'
            })[frog]
        )).join('') + append + ']';
    }
});