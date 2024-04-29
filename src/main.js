

class FileProcessor {
    constructor() {
        this.file = null;
        this.content = null;
        this.parsedContent = null;
    }

    setFile(file) {
        this.file = file;
    }

    async loadContent() {
        this.content = await this.file.text();
    }

    // parse csv content into array of objects with headers as keys
    // ; and , are used as delimiters
    async parseContent() {
        const lines = this.content.split('\n');
        const headers = lines[0].split(/;|,/);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(/;|,/);
            const obj = {};

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = values[j];
            }

            data.push(obj);
        }

        this.parsedContent = data;
    }

    process() {
        this.createMaxFromD1AndD2();
        this.removeValuesUnder30();
        this.sortValuesAscending();
        console.log('Processing file:', this.file);
    }

    removeValuesUnder30() {
        // remove values under 30 from Max[D1/D2]
        this.parsedContent = this.parsedContent.filter(obj => {
            if (Number.isNaN(obj['Max[D1/D2]'])) {
                return false;
            }
            return parseInt(obj['Max[D1/D2]'].toString().split(/\./g)[0]) >= 30;
        });

        
    }

    createMaxFromD1AndD2() {
        // create new column Max[um] with max value from D1[um] and D2[um]
        this.parsedContent.forEach(obj => {
            obj['Max[D1/D2]'] = Math.max(this.parseNumberValue(obj['D1[um]']), this.parseNumberValue(obj['D2[um]']));
        });

        console.log('Max created:', this.parsedContent);
    }

    parseNumberValue(value) {
        if (value === undefined) {
            return 0;
        }
        if (typeof value === 'number') {
            return value;
        }
        return parseFloat(value.replace(',', '.'));
    }


    sortValuesAscending() {
        // sort lines by the column Max[D1/D2] in ascending order
        // as number
        this.parsedContent.sort((a, b) => {
            return this.parseNumberValue(a['Max[D1/D2]']) - this.parseNumberValue(b['Max[D1/D2]']);
        });

        console.log('Values sorted:', this.parsedContent);





    }

    getFileName() {
        return this.file.name;
    }

    renderAsHtmlTable() {
        // render parsed content as html table
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var headers = Object.keys(this.parsedContent[0]);
        var headerRow = document.createElement('tr');
        headers.forEach(header => {
            var th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // add lazy loading with a load more button
        // add 10 rows at a time
        var rows = 0;
        var shownRows = 0;
        var loadMoreButton = document.createElement('button');
        loadMoreButton.textContent = 'Load more';

        // add count of lines to load more in brackets
        // and how many lines are left for loading
        loadMoreButton.textContent += ' (' + shownRows + '/' + (this.parsedContent.length - rows) + ')';


        loadMoreButton.addEventListener('click', () => {
            for (let i = 0; i < 10; i++) {
                if (rows < this.parsedContent.length) {
                    var obj = this.parsedContent[rows];
                    var row = document.createElement('tr');
                    headers.forEach(header => {
                        var td = document.createElement('td');
                        td.textContent = obj[header];
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                    rows++;
                }
            }
            shownRows += 10;
            // upadte load more button text
            loadMoreButton.textContent = 'Show more rows (' + shownRows + '/' + (this.parsedContent.length) + ')';
        }
        );

        loadMoreButton.click();


        // tbody.appendChild(loadMoreButton);

        table.appendChild(thead);
        table.appendChild(tbody);

        // wrap table in div and add h2 as title
        var div = document.createElement('div');
        var h2 = document.createElement('h2');
        var divHeaderWrap = document.createElement('div');
        // generate heading id
        h2.id = this.getFileName().replace(/\s/g, '_').replace(/\./g, '_');
        h2.textContent = this.getFileName();

        // add export button to heading
        var exportButton = document.createElement('button');
        exportButton.textContent = 'Export';
        exportButton.addEventListener('click', () => {
            this.exportAsCsv();
        });

        exportButton.classList.add('export-btn');

        divHeaderWrap.appendChild(h2);
        divHeaderWrap.appendChild(exportButton);


        div.appendChild(divHeaderWrap);
        div.appendChild(table);
        loadMoreButton.classList.add('load-more-btn');
        div.appendChild(loadMoreButton);

        return div;

    }

    exportAsCsv() {
        const headers = Object.keys(this.parsedContent[0]);
        const csv = [headers.join(';')];
        this.parsedContent.forEach(obj => {
            const row = headers.map(header => obj[header]);
            csv.push(row.join(';'));
        });

        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getFileName().replace('.csv', '_processed.csv');
        a.click();
        URL.revokeObjectURL(url);
    }


}


function main() {

    // get files from file input and read it
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', async function() {
        
        // create list of file names and render it to the page
        const fileList = document.createElement('ul');
        for (let file of fileInput.files) {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        }
        document.getElementById('toc').appendChild(fileList);


    });

}

async function processFiles() {
    const fileInput = document.getElementById('fileInput');
    for (let file of fileInput.files) {
        const fileProcessor = new FileProcessor();
        fileProcessor.setFile(file);
        await fileProcessor.loadContent();
        await fileProcessor.parseContent();
        await fileProcessor.process();

        const table = fileProcessor.renderAsHtmlTable();

        document.body.appendChild(table);
    }
    generateToCFromHeadings();
}

function generateToCFromHeadings(){
    const headings = document.querySelectorAll('h2');
    const toc = document.createElement('ul');
    for (let heading of headings) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = heading.textContent;
        a.href = '#' + heading.id;
        li.appendChild(a);
        toc.appendChild(li);
    }

    // clear toc first
    document.getElementById('toc').innerHTML = '';
    document.getElementById('toc').appendChild(toc);
}

function pressFileInput() {
    document.getElementById('fileInput').click();
}

main();