export let problems = [
    {
        title: 'Wolf, goat, cabbage',
        start: {
            wolf: 0,
            goat: 0,
            cabb: 0,
            boat: 0,
        },
        finish: {
            wolf: 1,
            goat: 1,
            cabb: 1,
            boat: 1,
        },
        check(data) {
            if (
                (data.wolf == data.goat && data.boat !== data.wolf) ||
                (data.goat == data.cabb && data.boat !== data.goat)
            ) {
                return false;
            }
            return true;
        },
        getChildrenData(data) {
            let children = [];
    
            children.push({...data, boat: data.boat ? 0 : 1});
        
            for (let passenger of ['wolf', 'goat', 'cabb']) {
                if (data.boat === data[passenger]) {
                    let child = {...data, boat: data.boat ? 0 : 1};
                    child[passenger] = child.boat;
                    children.push(child);
                }
            }
        
            return children;
        },
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (compare(state.data, this.start) || compare(state.data, this.finish)) {
                style = 'important';
                if (state.steps > 0) {
                    append = '-[<abstract id=' + state.id + 's>' + state.steps + ' steps' + ']';
                }
            }
            modifier = `<${style}table id=${state.id}>`;
            leftside = (!state.data.wolf ? '🐺' : '')
                + (!state.data.goat ? '🐐' : '')
                + (!state.data.cabb ? '🥬' : '');
            rightside = (state.data.wolf ? '🐺' : '')
                + (state.data.goat ? '🐐' : '')
                + (state.data.cabb ? '🥬' : '');
            return '[' + modifier + Object.values(state.data).toString() + '|'
                + (leftside || '-') + '|' + (rightside || '-') + '||'
                + (state.data.boat ? '-|🚣' : '🚣|-')
                + ']' + append;
        }
    },
    {
        title: 'Cannibals and priests',
        input_vars: {
            cannibals: 3,
            priests: 3,
            ship_capacity: 2,
        },
        input_types: {
            cannibals: 'number',
            priests: 'number',
            priests: 'number',
        },
        get start() {
            return {
                cannibals_left: this.input_vars.cannibals,
                priests_left: this.input_vars.priests,
                cannibals_right: 0,
                priests_right: 0,
                boat: 0
            }
        },
        get finish() {
            return {
                cannibals_left: 0,
                priests_left: 0,
                cannibals_right: this.input_vars.cannibals,
                priests_right: this.input_vars.priests,
                boat: 1
            }
        },
        check(data) {
            if (
                (data.cannibals_right > data.priests_right && data.priests_right > 0) ||
                (data.cannibals_left > data.priests_left && data.priests_left > 0)
            ) {
                return false;
            }
            return true;
        },
        getChildrenData(data) {
            let children = [];
        
            let [c, p] = data.boat
                ? [data.cannibals_right, data.priests_right]
                : [data.cannibals_left, data.priests_left];
        
            let combinations = [];
            for (let i = 0; i <= c; i++) {
                for (let j = 0; j <= p; j++) {
                    if (i + j > 0 && i + j <= this.input_vars.ship_capacity) {
                        combinations.push([i, j]);
                    }
                }
            }
            
            for (item of combinations) {
                let child = {...data, boat: data.boat ? 0 : 1};
                if (data.boat) {
                    child.cannibals_left += item[0];
                    child.priests_left += item[1];
                    child.cannibals_right -= item[0];
                    child.priests_right -= item[1];
                } else {
                    child.cannibals_right += item[0];
                    child.priests_right += item[1];
                    child.cannibals_left -= item[0];
                    child.priests_left -= item[1];
                }
                children.push(child);
            }
        
            return children;
        },
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (state.valid && (compare(state.data, this.start) || compare(state.data, this.finish))) {
                style = 'important';
                if (state.steps > 0) {
                    append = '-[<abstract id=' + state.id + 's>' + state.steps + ' steps' + ']';
                }
            }
            modifier = `<${style}table id=${state.id}>`;
            return '[' + modifier + Object.values(state.data).toString() + '|'
                + ('👺'.repeat(state.data.cannibals_left) || '-') + '|' + ('👺'.repeat(state.data.cannibals_right) || '-') + '||'
                + ('👴'.repeat(state.data.priests_left) || '-') + '|' + ('👴'.repeat(state.data.priests_right) || '-') + '||'
                + (state.data.boat ? '-|⛵' : '⛵|-')
                + ']' + append;
        }
    },
    {
        title: 'Jumping frogs',
        input_vars: {
            left_frogs: 2,
            right_frogs: 2,
            max_jump_length: 2,
            empty_spaces: 1
        },
        input_types: {
            left_frogs: 'number',
            right_frogs: 'number',
            max_jump_length: 'number',
            empty_spaces: 'number'
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
        getChildrenData(data) {
            let children = [];
        
            for (let index = 0; index < data.length; index++) {
                if (!data[index]) continue;
    
                for (let jump_length = 1; jump_length <= this.input_vars.max_jump_length; jump_length++) {
                    let dest = index + jump_length * data[index];
    
                    if (data[dest] !== undefined && !data[dest]) {
                        let child = [...data];
                        child[dest] = child[index];
                        child[index] = 0;
                        children.push(child)
                    }
                }
            }
        
            return children;
        },
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (state.valid && (compare(state.data, this.start) || compare(state.data, this.finish))) {
                style = 'important';
                if (state.steps > 0) {
                    append = '-[<abstract id=' + state.id + 's>' + state.steps + ' steps' + ']';
                }
            }
            modifier = `<${style}table id=${state.id}>`;
            return '[' + modifier + state.data.map(frog => (
                ({
                    1: '►',
                    0: '🞎',
                    '-1': '◄'
                })[frog]
            )).join('') + ']' + append;
        }
    },
    {
        title: 'Pathfinding dog',
        input_vars: {
            map: `D--
-XB
---`
        },
        input_types: {
            map: 'textarea'
        },
        vars: {},
        init() {
            let error = '';
            if (this.input_vars.map.indexOf('D') === -1) {
                error = 'Error: Map is missing the dog (D)';
            } else if (this.input_vars.map.indexOf('D') !== this.input_vars.map.lastIndexOf('D')) {
                error = 'Error: Map contains more than one dog (D)';
            }
            if (this.input_vars.map.indexOf('B') === -1) {
                error = 'Error: Map is missing the bone (B)';
            } else if (this.input_vars.map.indexOf('B') !== this.input_vars.map.lastIndexOf('B')) {
                error = 'Error: Map contains more than one bone (B)';
            }
            if (error !== '') {
                alert(error);
                return false;
            }
            this.vars.table = this.input_vars.map.trim().split("\n").map(row => row.split(''));
            for (let y in this.vars.table) {
                for (let x in this.vars.table[y]) {
                    if (this.vars.table[y][x] === 'D')
                        this.vars.start_position = {x: ~~x, y: ~~y};
                    if (this.vars.table[y][x] === 'B')
                        this.vars.finish_position = {x: ~~x, y: ~~y};

                }
            }
            return true;
        },
        get start() {
            return this.vars.start_position;
        },
        get finish() {
            return this.vars.finish_position;
        },
        check(data) {
            return true;
        },
        getChildrenData(data) {
            let children = [];

            for (let move of [
                [1, 0],
                [0, 1],
                [-1, 0],
                [0, -1],
            ]) {
                let dest_x = data.x + move[0];
                let dest_y = data.y + move[1];
                if (
                    this.vars.table[dest_y] &&
                    this.vars.table[dest_y][dest_x] &&
                    this.vars.table[dest_y][dest_x] !== 'X'
                ) {
                    children.push({x: dest_x, y: dest_y});
                }
            }
        
            return children;
        },
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (state.valid && (compare(state.data, this.start) || compare(state.data, this.finish))) {
                style = 'important';
                if (state.steps > 0) {
                    append = '-[<abstract id=' + state.id + 's>' + state.steps + ' steps' + ']';
                }
            }
            modifier = `<${style}table id=${state.id}>`;
            return '[' + modifier + Object.values(state.data).toString() + '|' + this.vars.table.map(
                (row, y) => row.map(
                    (item, x) => {
                        if (compare({x, y}, state.data)) return '🐶';
                        if (compare({x, y}, this.vars.finish_position)) return '🦴';
                        if (item === 'X') return '🔥';
                        return 'ㅤ';
                    }
                ).join('|')
            ).join('||') + ']' + append;
        }
    }
];