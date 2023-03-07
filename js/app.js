import Alpine from 'alpinejs'
import { problems } from './problems';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

import example_problem from './example.mjs';

let editor = new EditorView({
    extensions: [basicSetup, javascript()],
    parent: qs('#editor'),
    doc: _get('search3_custom_problem') || example_problem,
});

window.editor = editor;

problems.push({
    title: 'User-defined',
    custom: true,
});

window.Alpine = Alpine;

let app = Alpine.reactive({
    problem_id: 0,
    problems: problems,
    get problem() {
        return this.problems[this.problem_id];
    },
    format: 'pretty',
    direction: 'down',
    output: 'png',
    mode: 'all',

    button_text: 'Generate',
    log: '',
    result_output: '',
    svg_output: '',
    start_time: null,
    
    tree: {
        steps: 0,
    }
});

window.app = app;

document.addEventListener('alpine:init', () => {
    Alpine.data('application', () => ({
        saveCode() {
            let code_str = editor.state.doc.toString();
            _set('search3_custom_problem', code_str);
        },
        loadExample() {
            if (confirm("This will overwrite the current code.\nAre you sure?")) {
                const update = editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: example_problem}});
                editor.update([update]);
            }
        },
        generate() {
            if (app.problem.init) {
                if (!app.problem.init()) {
                    return;
                }
            }
            if (app.problem.custom) {
                custom_problem = null;
                let err = [];
                let code_str = editor.state.doc.toString();
                try {
                    eval(code_str);
                    if (!custom_problem)
                        err.push('An object called `custom_problem` could not be found.');
                    if (!custom_problem?.start || !['object', 'array'].includes(typeof custom_problem?.start))
                        err.push('The custom_problem class should have a `start` object.');
                    if (!custom_problem?.finish || !['object', 'array'].includes(typeof custom_problem?.finish))
                        err.push('The custom_problem class should have a `finish` object.');
                    if (!custom_problem?.check || typeof custom_problem?.check !== 'function')
                        err.push('The custom_problem class should have a `check` method.');
                    if (!custom_problem?.getChildrenData || typeof custom_problem?.getChildrenData !== 'function')
                        err.push('The custom_problem class should have a `getChildrenData` method.');
                } catch (e) {
                    alert(e.toString());
                    err.push('An error occured while validating the problem code.');
                }
                if (err.length) {
                    alert(err.join("\n\n"));
                } else {
                    custom_problem.custom = true;
                    let index = app.problems.map(p => p.custom).indexOf(true);
                    problems[index] = custom_problem;
                    setTimeout(() => {
                        generateGraph();
                    }, 20);
                }
            } else {
                setTimeout(() => {
                    generateGraph();
                }, 20);
            }
        }
    }));
});

let source_base = `
#lineWidth: 1
#spacing: 25
#arrowSize: 0.7
#gutter: 1

#background #eee
#.good: fill=#9f9 bold
#.bad: fill=white dashed
#.important: fill=#99f bold
#.goodtable: fill=#9f9 bold visual=table
#.badtable: fill=white dashed visual=table
#.importanttable: fill=#99f bold visual=table
`;

let data_lookup = [];

function expandTree(state, counter = 1) {
    if (counter === 1) {
        data_lookup = [];
    }
    if (!state.valid || compare(state.data, app.problem.finish)) {
        return;
    }
    let children = app.problem.getChildrenData(state.data);
    
    children = children.map((data, index) => {
        child = {
            id: state.id + 'i' + index,
            data: data,
            parent: state,
            valid: app.problem.check(data),
            steps: counter,
        };

        return child;
    });

    children = children.filter(child => !parentHasState(child.parent, child));
    
    if (app.mode === 'shortest') {
        for (child of children) {
            if (child.valid) {
                let best_match_steps = null;
                for (saved_data of data_lookup) {
                    if (
                        compare(saved_data[0], child.data) &&
                        (!best_match_steps || saved_data[1] < best_match_steps)
                    ) {
                        best_match_steps = saved_data[1];
                    }
                }
                if (best_match_steps && best_match_steps <= child.steps) {
                    child.valid = false;
                }
            }
        }
        children = children.filter(child => child.valid);
    }

    for (child of children) {
        data_lookup.push([
            child.data,
            child.steps,
        ]);
        if (child.valid) {
            expandTree(child, counter + 1)
        }
    }

    state.children = children;
}

function treeContains(state, tree) {
    return compare(state.data, tree.data) ||
        (tree.children || []).some(child => treeContains(state, child));
}

function getExistingItemsByData(data, tree, exclude_id = null) {
    let results = [];
    if (compare(data, tree.data) && tree.id !== exclude_id) {
        results.push(tree);
    }
    for (child of tree.children || []) {
        child_results = getExistingItemsByData(data, child, exclude_id);
        if (child_results.length) {
            results.push(...child_results);
        }
    }
    return results;
}

function getBestChild(tree) {
    return getExistingItemsByData(app.problem.finish, tree)
        .sort((a,b) => a.steps - b.steps)[0] || null;
}

function cleanUpTree(ending) {
    if (ending.parent) {
        if (ending.parent.children.length > 1) {
            ending.parent.children = ending.parent.children.filter(child => child.id === ending.id);
        }
        cleanUpTree(ending.parent);
    }
}

function parentHasState(prev, state) {
    return compare(prev.data, state.data) || (
        prev.parent && parentHasState(prev.parent, state)
    );
}

/* Generate string output based on data */
function render(state) {
    if (app.format === 'pretty' && app.problem.customRender) {
        return app.problem.customRender(state);
    }
    let style = state.valid ? 'good' : 'bad';
    let append = '';
    if (compare(state.data, app.problem.start) || compare(state.data, app.problem.finish)) {
        style = 'important';
        if (state.steps > 0) {
            append = '|' + state.steps + ' steps';
        }
    }
    modifier = `<${style} id=${state.id}>`;
    // modifier = `<${style}>`;
    return '[' + modifier + Object.values(state.data).toString() + append + ']';
}

/* Generate source code for the diagram */
function printTree(tree, prev = null) {
    rows = [];
    if (prev) {
        rows.push(render(prev) + '->' + render(tree));
    } else {
        rows.push(render(tree));
    }
    for (item of tree.children || []) {
        rows = rows.concat(printTree(item, tree));
    }
    return rows.join('\n');
}

let tree = {
    steps: 0,
}

function generateGraph() {
    app.button_text = 'Solving...';
    app.log = '';
    app.start_time = new Date();
    app.tree = {
        id: 0,
        data: app.problem.start,
        valid: app.problem.check(app.problem.start),
        steps: 0,
    }
    try {
        expandTree(app.tree);

        if (app.mode === 'shortest') {
            let best_child = getBestChild(app.tree);
            if (!best_child) {
                alert('Could not find any solve paths.');
            } else {
                cleanUpTree(best_child);
            }
        }
        app.log = 'Data tree expanded in ' + ((new Date() - app.start_time)/1000).toFixed(3) + ' seconds.';
    } catch (err) {
        alert(err.toString());
        app.log += 'An error occured while expanding data tree.';
    }

    app.button_text = 'Rendering...';
    
    setTimeout(() => {
        app.start_time = new Date();
        try {
            let graph = printTree(app.tree);
    
            // let source = source_base + `[<container>${app.problem.title}|\n${graph}\n]`;
            
            let extra_options = `
#direction: ${app.direction}
            `;
            let source = extra_options + source_base + graph;

            // console.log(source);
            
            if (app.output === 'png') {
                nomnoml.draw(qs('#canvas_output'), source);
            } else {;
                app.svg_output = nomnoml.renderSvg(source);
            }

            app.log += ' Rendered in ' + ((new Date() - app.start_time)/1000).toFixed(3) + ' seconds.';
            app.result_output = app.output;
        } catch (err) {
            alert('An error occured:\n' + err.toString());
            app.log += ' Rendering was unsuccessful.';
        }
        app.button_text = 'Generate';
    }, 20);
}

window.onbeforeunload = function() {
    if (app.problem.custom) {
        return true;
    }
}

Alpine.start();