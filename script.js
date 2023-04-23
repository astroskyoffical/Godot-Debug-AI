document.getElementById('add-parent-node').addEventListener('click', addParentNode);
document.getElementById('generate-prompt').addEventListener('click', generatePrompt);
document.getElementById('script-uploads').addEventListener('change', handleScriptUploads);

let selectedNode = null;

function addParentNode() {
    const parentNode = document.createElement('li');
    const nodeName = prompt('Enter parent node name:');
    if (!nodeName) return;
    parentNode.onmouseenter = handleNodeMouseEnter;
    parentNode.onmouseleave = handleNodeMouseLeave;
    parentNode.onclick = handleNodeClick;

    const childrenList = document.createElement('ul');
    parentNode.appendChild(childrenList);

    const addChildrenText = document.createElement('button');
    addChildrenText.type = 'button';
    addChildrenText.textContent = 'Add Child Node';
    addChildrenText.onclick = function () {
        addChildNode(childrenList);
    };

    parentNode.appendChild(addChildrenText);

    const nodeNameContainer = document.createElement('div');
    nodeNameContainer.className = 'nodeNameContainer';
    const nodeNameSpan = document.createElement('span');
    nodeNameSpan.textContent = nodeName;
    nodeNameContainer.appendChild(nodeNameSpan);
    parentNode.insertBefore(nodeNameContainer, parentNode.firstChild);

    document.getElementById('node-tree-list').appendChild(parentNode);
}

function addChildNode(parentList) {
    const childNode = document.createElement('li');
    const nodeName = prompt('Enter child node name:');
    if (!nodeName) return;
    childNode.onmouseenter = handleNodeMouseEnter;
    childNode.onmouseleave = handleNodeMouseLeave;
    childNode.onclick = handleNodeClick;

    parentList.appendChild(childNode);

    const nodeNameContainer = document.createElement('div');
    nodeNameContainer.className = 'nodeNameContainer';
    const nodeNameSpan = document.createElement('span');
    nodeNameSpan.textContent = nodeName;
    nodeNameContainer.appendChild(nodeNameSpan);
    childNode.insertBefore(nodeNameContainer, childNode.firstChild);
}

function handleNodeMouseEnter() {
    const nodeNameContainer = this.querySelector('.nodeNameContainer');
    nodeNameContainer.style.backgroundColor = 'lightgray';
}

function handleNodeMouseLeave() {
    const nodeNameContainer = this.querySelector('.nodeNameContainer');
    nodeNameContainer.style.backgroundColor = selectedNode === this ? 'gray' : '';
}

function handleNodeClick(event) {
  if (event.target.tagName === 'BUTTON') return;
  if (selectedNode) {
    const previousNodeNameContainer = selectedNode.querySelector('.nodeNameContainer');
    previousNodeNameContainer.style.backgroundColor = '';
  }
const nodeNameContainer = event.target.classList.contains('nodeNameContainer')
    ? event.target
    : event.target.querySelector('.nodeNameContainer');

  selectedNode = nodeNameContainer.parentNode;
  nodeNameContainer.style.backgroundColor = 'gray';

  showAddScriptLink();

  if (selectedNode.getAttribute('data-script')) {
    showDeleteScriptLink();
  } else {
    hideDeleteScriptLink();
  }
}

function showAddScriptLink() {
    const addScriptLink = document.getElementById('add-script');
    if (!addScriptLink) {
        const link = document.createElement('button');
        link.id = 'add-script';
        link.textContent = 'Add Script';
        link.onclick = addScriptToSelectedNode;

        document.getElementById('node-tree-list').parentNode.appendChild(link);
    } else {
        addScriptLink.style.display = 'inline-block';
    }
}

function hideAddScriptLink() {
    const addScriptLink = document.getElementById('add-script');
    addScriptLink.style.display = 'none';
}

function showDeleteScriptLink() {
    const deleteScriptLink = document.getElementById('delete-script');
    if (!deleteScriptLink) {
        const link = document.createElement('button');
        link.id = 'delete-script';
        link.textContent = 'Delete Script';
        link.onclick = function () {
            deleteScriptFromSelectedNode();
            return false;
        };
        link.style.display = 'inline-block';

        document.getElementById('node-tree-list').parentNode.appendChild(link);
    } else {
        deleteScriptLink.style.display = 'inline-block';
    }
}

function hideDeleteScriptLink() {
    const deleteScriptLink = document.getElementById('delete-script');
    deleteScriptLink.style.display = 'none';
}

function addScriptToSelectedNode(event) {
    event.preventDefault();
    if (!selectedNode) return;

    const scriptName = document.querySelector('.script-link.selected');
    if (!scriptName) return;

    selectedNode.setAttribute('data-script', `${scriptName.textContent}`);

    const scriptIndicator = document.createElement('span');
    scriptIndicator.textContent = ` (script: ${scriptName.textContent})`;
    const nodeNameContainer = selectedNode.querySelector('.nodeNameContainer');
    nodeNameContainer.appendChild(scriptIndicator);

    showDeleteScriptLink();
}

function deleteScriptFromSelectedNode() {
    if (!selectedNode) return;

    const nodeNameContainer = selectedNode.querySelector('.nodeNameContainer');
    const scriptIndicator = nodeNameContainer.querySelector('span:last-child');
    nodeNameContainer.removeChild(scriptIndicator);

    selectedNode.removeAttribute('data-script');
    hideDeleteScriptLink();
}

function handleScriptUploads(e) {
    const files = e.target.files;
    let filesLength = files.length;

    const reader = new FileReader();
    let fileContent = document.getElementById('script-content').value;

    reader.onload = function (e) {
        const currentFile = files[filesLength - 1];
        fileContent += `[${currentFile.name}]\n` + e.target.result + '\n\n';

        if (filesLength > 1) {
            const nextFile = files[filesLength - 2];
            filesLength--;
            reader.readAsText(nextFile);
        } else {
            document.getElementById('script-content').value = fileContent;
        }

        createScriptLink(currentFile.name);
    }

    if (filesLength) {
        reader.readAsText(files[0]);
    }
}

function createScriptLink(scriptName) {
    const scriptLink = document.createElement('button');
    scriptLink.type = 'button';
    scriptLink.textContent = scriptName;
    scriptLink.className = 'script-link';
    scriptLink.addEventListener('click', handleScriptLinkClick);
    document.getElementById('script-content').parentNode.insertBefore(scriptLink, document.getElementById('script-content'));
}

function handleScriptLinkClick(e) {
    const scriptLinks = document.querySelectorAll('.script-link');
    scriptLinks.forEach(scriptLink => {
        scriptLink.classList.remove('selected');
    });

    e.target.classList.add('selected');
}

function generatePrompt() {
    const nodeTreeList = getNodeTree(document.getElementById('node-tree-list'));
    const scriptContent = document.getElementById('script-content').value;
    const issues = document.getElementById('issues').value;
    const expectedBehavior = document.getElementById('expected-behavior').value;

    const outputText = `
Game issue in Godot 3:
${issues}

Expected behavior:
${expectedBehavior}

Encountered errors (if any):
[List any error messages or unexpected behaviors you have encountered]

Current GDScript(s) involved:
${scriptContent}

Node tree structure:
${nodeTreeList}
  `;

    const filename = 'Godot_Game_Issues.txt';
    const filetype = 'text/plain;charset=utf-8';

    const file = new Blob([outputText], {type: filetype});
    const fileURL = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = fileURL;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(fileURL);
}

function getNodeTree(nodeList, depth = 0) {
  let structure = '';
  const indentation = '  '.repeat(depth);

  for (const listItem of nodeList.children) {
    if (listItem.tagName === 'LI') {
      const nodeText = listItem.childNodes[0].childNodes[0].textContent;
      const scriptId = listItem.getAttribute('data-script') ? ` (script: ${listItem.getAttribute('data-script')})` : '';

      const relationshipSymbol = depth > 0 ? '->' : '';
      structure += `\n${indentation}${relationshipSymbol}${nodeText}${scriptId}`;

      const childNodeList = listItem.getElementsByTagName('ul')[0];
      if (childNodeList) {
        structure += getNodeTree(childNodeList, depth + 1);
      }
    }
  }

  return structure;
}