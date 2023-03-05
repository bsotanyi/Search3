import Alpine from 'alpinejs'
import { problems } from './problems';
import * as helpers from './helpers';

window.Alpine = Alpine

let start_time = null;

let input_html = '';
for (let i in problems) {
    let new_opt = new Option(problems[i].title, i);
    helpers.qs('#problem').add(new_opt, undefined);

    if (problems[i].input_vars) {
        let inputs = ``;
        for (key in problems[i].input_vars) {
            inputs += `
                <label>${key}</label>
                <div class="js-num">
                    <button type="button" class="js-minus">-</button>
                    <input name="${key}" type="number" value="${problems[i].input_vars[key]}">
                    <button type="button" class="js-plus">+</button>
                </div>
            `;
        }
        input_html += `<form style="display:none" data-input-vars data-problem-id="${i}">
            <fieldset class="grid-2">
                <legend>Input variables</legend>
                ${inputs}
            </fieldset>
        </form>`;
    }
}
helpers.qs('#problem').add(new Option('Custom', -1));
helpers.qs('#input_area').innerHTML = input_html;
for (let num of helpers.qsa('.js-num')) {
    helpers.qs('.js-plus', num).onclick = () => helpers.qs('input', num).value = ~~helpers.qs('input', num).value + 1;
    helpers.qs('.js-minus', num).onclick = () => helpers.qs('input', num).value = ~~helpers.qs('input', num).value - 1;
}

helpers.qs('#problem').addEventListener('input', function() {
    refreshInputArea(this.value);
});
refreshInputArea(helpers.qs('#problem').value);

function refreshInputArea(problem_id) {
    for (block of helpers.qsa(`[data-input-vars]:not([data-problem-id="${problem_id}"])`)) {
        block.style.display = 'none';
    }
    if (helpers.qs(`[data-problem-id="${problem_id}"]`)) {
        helpers.qs(`[data-problem-id="${problem_id}"]`).style.display = 'grid';
    }
}

// Generate start
helpers.qs('#generate_btn').addEventListener('click', function (e) {
    e.preventDefault();
    generate_info.innerText = '';
    generate_btn.disabled = true;
    generate_btn.value = 'Solving...';
    form = document.forms.input;
    let form_data = helpers.serializeForm(form);
    form_data.problem = problems[form_data.problem];
    if (helpers.qs(`[data-problem-id="${form.problem.value}"]`)) {
        form_data.problem.input_vars = helpers.serializeForm(
            helpers.qs(`[data-problem-id="${form.problem.value}"]`)
        );
        for (key in form_data.problem.input_vars) {
            form_data.problem.input_vars[key] = parseInt(form_data.problem.input_vars[key]);
        }
    }
    setTimeout(() => {
        start_time = new Date();
        printGraph(form_data);
    }, 20);
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

function expandTree(state, config, counter = 1) {
    if (!state.valid || helpers.compare(state.data, config.problem.finish)) {
        return;
    }
    let children = config.problem.getChildrenData(state);
    
    children = children.map(child => {
        child = {
            id: helpers.newId(),
            data: child,
            parent: state,
            valid: config.problem.check(child),
            steps: counter,
        };

        return child;
    });

    children = children.filter(child => !parentHasState(child.parent, child));
    
    if (config.mode === 'shortest') {
        // we need to pass the data to the original tree, so we can search in it right after
        state.children = children;

        for (child of state.children) {
            let best_match = getExistingItemsByData(child.data, tree, child.id)
                .sort((a,b) => a.steps - b.steps)[0] || null;
            if (best_match && best_match.steps <= child.steps) {
                // the tree already contains this position, with a smaller step count, so we can discard this
                child.valid = false;
            }
        }

        state.children = state.children.filter(child => child.valid);
    }

    for (child of (config.mode === 'all' ? children : state.children)) {
        if (child.valid) {
            expandTree(child, config, counter + 1)
        }
    }

    if (config.mode === 'all') {
        state.children = children;
    }
}

function treeContains(state, tree) {
    return helpers.compare(state.data, tree.data) ||
        (tree.children || []).some(child => treeContains(state, child));
}

function getExistingItemsByData(data, tree, exclude_id = null) {
    let results = [];
    if (helpers.compare(data, tree.data) && tree.id !== exclude_id) {
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

function getBestChild(tree, config) {
    return getExistingItemsByData(config.problem.finish, tree)
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
    return helpers.compare(prev.data, state.data) || (
        prev.parent && parentHasState(prev.parent, state)
    );
}

/* Generate string output based on data */
function render(state, config) {
    if (config.format === 'pretty' && config.problem.customRender) {
        return config.problem.customRender(state);
    }
    let style = state.valid ? 'good' : 'bad';
    let append = '';
    if (helpers.compare(state.data, config.problem.start) || helpers.compare(state.data, config.problem.finish)) {
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
function printTree(tree, config, prev = null) {
    rows = [];
    if (prev) {
        rows.push(render(prev, config) + '->' + render(tree, config));
    } else {
        rows.push(render(tree, config));
    }
    for (item of tree.children || []) {
        rows = rows.concat(printTree(item, config, tree));
    }
    return rows.join('\n');
}

let tree = {
    steps: 0,
}

function printGraph(config) {
    tree = {
        id: helpers.newId(),
        data: config.problem.start,
        valid: config.problem.check(config.problem.start),
        steps: 0,
    }
    try {
        expandTree(tree, config);

        if (config.mode === 'shortest') {
            let best_child = getBestChild(tree, config);
            if (!best_child) {
                alert('Could not find any solve paths.');
            } else {
                cleanUpTree(best_child);
            }
        }
    } catch (err) {
        alert('An error occured while expanding data tree: ' + err.toString());
        return;
    }
    
    generate_btn.value = 'Rendering...';
    generate_info.innerText = 'Data tree expanded in ' + ((new Date() - start_time)/1000).toFixed(3) + ' seconds.';
    
    setTimeout(() => {
        start_time = new Date();
        try {
            let graph = printTree(tree, config);
    
            // let source = source_base + `[<container>${config.problem.title}|\n${graph}\n]`;
            
            let extra_options = `
#direction: ${config.direction}
            `;
            let source = extra_options + source_base + graph;
    
            
            if (config.output === 'png') {
                helpers.qs('#canvas_output').style.display = 'block';
                nomnoml.draw(helpers.qs('#canvas_output'), source);
                helpers.qs('#svg_output').innerHTML = '';
                helpers.qs('#svg_output').style.display = 'none';
            } else {
                helpers.qs('#canvas_output').style.display = 'none';
                svg = nomnoml.renderSvg(source);
                helpers.qs('#svg_output').innerHTML = svg;
                helpers.qs('#svg_output').style.display = 'inline-block';
            }

        } catch (err) {
            alert('An error occured:\n' + err.toString());
            throw err;
            return;
        }
        generate_info.innerText += ' Rendered in ' + ((new Date() - start_time)/1000).toFixed(3) + ' seconds.';
        generate_btn.value = 'Generate';
        generate_btn.disabled = false;
    }, 20);

}

Alpine.start();