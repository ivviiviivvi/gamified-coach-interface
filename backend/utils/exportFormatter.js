const PDFDocument = require('pdfkit');

/**
 * Normalize workspace rows coming from raw SQL to a safe JS object.
 */
function normalizeWorkspace(workspace) {
  if (!workspace) return null;

  let parsedData = workspace.data;
  if (typeof parsedData === 'string') {
    try {
      parsedData = JSON.parse(parsedData);
    } catch (error) {
      parsedData = workspace.data;
    }
  }

  return {
    ...workspace,
    data: parsedData || {},
  };
}

function formatValue(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return JSON.stringify(value, null, 2);
}

function renderMarkdownFromData(data, depth = 0) {
  const indent = '  '.repeat(depth);

  if (Array.isArray(data)) {
    if (data.length === 0) return `${indent}- (empty)\n`;
    return data.map(item => `${indent}- ${formatValue(item)}\n`).join('');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([key, value]) => {
      const heading = `${indent}- **${key}**:`;
      if (typeof value === 'object' && value !== null) {
        return `${heading}\n${renderMarkdownFromData(value, depth + 1)}`;
      }
      return `${heading} ${formatValue(value)}\n`;
    }).join('');
  }

  return `${indent}- ${formatValue(data)}\n`;
}

function workspaceToMarkdown(workspace) {
  const lines = [
    `# Strategy Workspace: ${workspace.name || 'Untitled'}`,
    `- Workspace ID: ${workspace.id}`,
    `- Terminal Type: ${workspace.terminal_type}`,
    `- Exported At: ${workspace.exported_at || new Date().toISOString()}`,
    '',
    '## Data',
    renderMarkdownFromData(workspace.data || {}),
  ];

  return lines.join('\n');
}

function renderPdfSection(doc, data, depth = 0) {
  const indent = ' '.repeat(depth * 2);

  if (Array.isArray(data)) {
    if (data.length === 0) {
      doc.text(`${indent}- (empty)`);
      return;
    }
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        doc.text(`${indent}-`);
        renderPdfSection(doc, item, depth + 1);
      } else {
        doc.text(`${indent}- ${formatValue(item)}`);
      }
    });
    return;
  }

  if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        doc.text(`${indent}- ${key}:`);
        renderPdfSection(doc, value, depth + 1);
      } else {
        doc.text(`${indent}- ${key}: ${formatValue(value)}`);
      }
    });
    return;
  }

  doc.text(`${indent}- ${formatValue(data)}`);
}

function streamWorkspacePdf(workspace, res) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text(`Strategy Workspace: ${workspace.name || 'Untitled'}`, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Workspace ID: ${workspace.id}`);
  doc.text(`Terminal Type: ${workspace.terminal_type}`);
  doc.text(`Exported At: ${workspace.exported_at || new Date().toISOString()}`);

  doc.moveDown();
  doc.fontSize(14).text('Strategy Data', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11);
  renderPdfSection(doc, workspace.data || {}, 0);

  doc.end();
}

module.exports = {
  normalizeWorkspace,
  workspaceToMarkdown,
  streamWorkspacePdf,
};
