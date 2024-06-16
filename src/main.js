

let rainbowModeAct = false;
let fileProcessors = [];

const tocTitle = `<strong title="Link to all processed tables on this site, just click on a file name 😊" class="tocTitleColor" style="margin-top: 1rem;font-size: 2rem; vertical-align: sub;">Table of contents</strong>
                    <img title="Steve" src="icon.png" style="vertical-align: bottom; height:3rem">`;

class FileProcessor {
    constructor() {
        this.file = null;
        this.content = null;
        this.parsedContent = null;
        fileProcessors.push(this);
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
        // remove \r
        lines.forEach((line, index) => {
            lines[index] = line.replace('\r', '');
        });
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
        this.originalContent = JSON.parse(JSON.stringify(data.filter(obj => obj['D1[um]'] !== undefined && obj['D2[um]'] !== undefined)));
    }

    process() {
        this.createMaxFromD1AndD2();
        this.removeValuesUnder30();
        this.sortValuesAscending();

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


        var loadMore = (howMany) => {
            for (let i = 0; i < howMany; i++) {
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
            shownRows += howMany;
            if (rows >= this.parsedContent.length) {
                // remove load more button
                loadMoreButton.style.display = 'none';
            }
            // upadte load more button text
            loadMoreButton.textContent = 'Show more rows (' + shownRows + '/' + (this.parsedContent.length) + ')';

        }


        loadMoreButton.addEventListener('click', () => {
            loadMore(100000);
        }
        );

        loadMore(10);



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
        exportButton.innerHTML = '<span class="material-symbols-outlined">download</span>Export';
        exportButton.addEventListener('click', () => {
            this.export();
        });
        exportButton.style.width = '7rem';

        exportButton.classList.add('export-btn');

        divHeaderWrap.appendChild(h2);
        divHeaderWrap.appendChild(exportButton);

        divHeaderWrap.style.marginTop = '1rem';
        divHeaderWrap.style.marginBottom = '0.5rem';


        div.appendChild(divHeaderWrap);
        div.appendChild(table);
        loadMoreButton.classList.add('load-more-btn');
        div.appendChild(loadMoreButton);

        div.classList.add('table-wrap');

        return div;

    }

    export() {
        let fileType = getFileType();

        if (fileType === '.csv') {
            this.exportAsCsv();
        } else if (fileType === '.xlsx') {
            this.exportAsExcel();
        }
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

    exportAsExcel() {
        const headers = Object.keys(this.parsedContent[0]);
        const data = [headers];
        this.parsedContent.forEach(obj => {
            const row = headers.map(header => obj[header]);
            data.push(row);
        });

        // set datatypes for excel columns
        const types = data[1].map(() => 's');
        types[0] = 's';


        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(wb, ws, 'Bearbeitet');

        // set data type to string for every column
        // ws['!cols'] = types.map(type => ({ t: type }));
        for (let k in ws) {
            let c = ws[k];
            if (c.t) {
                c.t = 's';
            }
        }



        // add old sheet to excel file as new book originalContent
        const headers2 = Object.keys(this.originalContent[0]);
        const data2 = [headers2];
        this.originalContent.forEach(obj => {
            const row = headers2.map(header => obj[header]);
            data2.push(row);
        }
        );

        const ws2 = XLSX.utils.aoa_to_sheet(data2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Original');
        for (let k in ws2) {
            let c = ws2[k];
            if (c.t) {
                c.t = 's';
            }
        }

        // set col width for all columns
        ws['!cols'] = headers.map(() => ({ wch: 16 }));
        ws2['!cols'] = headers2.map(() => ({ wch: 16 }));


        XLSX.writeFile(wb, this.getFileName().replace('.csv', '_processed.xlsx'));
    
    }


}

// function that goes through the steps and set the next to present every second
let stepInterval = null;
function goThroughSteps() {
    // get all steps
    stepInterval = setInterval(() => {
        var stepList = document.getElementById('stepList')
        var steps = document.getElementsByTagName('li', stepList)
        var activeIndex = 0;

        for (let i = 0; i < steps.length; i++) {
            if (steps[i].classList.contains('present')) {
                activeIndex = i;
                break;
            }
        }

        activeIndex = (activeIndex + 1) % steps.length;

        for (let i = 0; i < steps.length; i++) {
            if (i === activeIndex) {
                steps[i].classList.add('present');
                steps[i].classList.remove('past')   
            } else {
                steps[i].classList.remove('present');
                steps[i].classList.add('past');
            }
        }

    }, 1500);

}

function main() {

    // goThroughSteps();

    // get files from file input and read it
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', async function() {

        // activate process button when files are selected
        document.getElementById('process-btn').disabled = false;

        // add disabled class
        document.getElementById('process-btn').classList.remove('disabled');

        // create list of file names and render it to the page
        const fileList = document.createElement('ul');
        for (let file of fileInput.files) {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        }
        // clear toc
        document.getElementById('toc').innerHTML = '';

        // add header to toc
        const tocHeader = document.createElement('h2');
        tocHeader.innerHTML = tocTitle;
        tocHeader.style.marginTop = '1rem';
        tocHeader.style.marginBottom = '0.5rem';
        tocHeader.style.rowHeight = '1.5rem';
        fileList.style.marginTop = '0.25rem';
        document.getElementById('toc').appendChild(tocHeader);
        

        document.getElementById('toc').appendChild(fileList);


    });

}

async function processFiles() {

    setBusy(true);

    try {
        fileProcessors = [];
        // remove all divs with class table-wrap
        document.querySelectorAll('.table-wrap').forEach(div => {
            div.remove();
        });
    
        const fileInput = document.getElementById('fileInput');
        for (let file of fileInput.files) {
            const fileProcessor = new FileProcessor();
            fileProcessor.setFile(file);
            await fileProcessor.loadContent();
            await fileProcessor.parseContent();
            await fileProcessor.process();
    
            const table = fileProcessor.renderAsHtmlTable();
    
            document.getElementsByClassName('container')[0].appendChild(table);
        }
        generateToCFromHeadings();
    
        // disable process button
        document.getElementById('process-btn').disabled = true;
        document.getElementById('process-btn').classList.add('disabled');
        setBusy(false);

        if (rainbowModeAct) {
            rainbowMode();
        } else {
            boringMode();
        }


    } catch (err) {
        console.error(err);
        setBusy(false);
    }


}

function generateToCFromHeadings(){

    // clear toc first
    document.getElementById('toc').innerHTML = '';

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
    // add download all link to toc
    const downloadAll = document.createElement('a');
    const li = document.createElement('li');

    downloadAll.innerHTML = `<span class="material-symbols-outlined" style="font-weight: bold">
download
</span>
    <span style="text-decoration: none; font-weight: bold;" title="Downloads all tables as csv or excel file - can be changed via the selection at the top of the page">Export all</span>`;
    downloadAll.href = '#';
    downloadAll.addEventListener('click', exportAll);
    downloadAll.style.textDecoration = 'none';
    li.appendChild(downloadAll);

    li.style.marginTop = '1rem';
    li.style.marginBottom = '2rem';

    toc.appendChild(li);

    
    const tocHeader = document.createElement('h2');
    tocHeader.innerHTML = tocTitle;
    tocHeader.style.marginTop = '1rem';
    tocHeader.style.marginBottom = '0.5rem';
    tocHeader.style.rowHeight = '1.5rem';
    toc.style.marginTop = '0.25rem';
    document.getElementById('toc').appendChild(tocHeader);


    document.getElementById('toc').appendChild(toc);
}

function pressFileInput() {
    document.getElementById('fileInput').click();
}

async function exportAll() {

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (let i = 0; i < fileProcessors.length; i++) {
        fileProcessors[i].export();
        await wait(200);
    }
}

function clearAll() {
    document.body.innerHTML = '';
    document.getElementById('toc').innerHTML = '';
}

function setBusy(busy) {
    var ind = document.getElementById('busyIndicator');
    if (busy) {
        ind.classList.add('busyIndicator_Enable');
        ind.classList.remove('busyIndicator_Disable');
    } else {
        ind.classList.remove('busyIndicator_Enable');
        ind.classList.add('busyIndicator_Disable');
        
    }
}

function rainbowMode() {

    rainbowModeAct = true;

    // get all buttons and add rainbow class
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('rainbow');
    });

    // set background colors for site and tables to #003165
    document.body.style.backgroundColor = '#003165';

    // set text color to white

    document.body.style.color = 'white';

    // set h2 color to white
    const h2s = document.querySelectorAll('h2');
    h2s.forEach(h2 => {
        h2.style.color = 'white';
    });

    // set th color to white
    const ths = document.querySelectorAll('th');
    ths.forEach(th => {
        th.style.color = 'white';
    });

    // set td color to white
    const tds = document.querySelectorAll('td');
    tds.forEach(td => {
        td.style.color = 'white';
    });

    // set a color to white
    const as = document.querySelectorAll('a');
    as.forEach(a => {
        a.style.color = 'white';
    });

    // set li color to white
    const lis = document.querySelectorAll('li');
    lis.forEach(li => {
        li.style.color = 'white';
    });

    nyancat();

    // set button text color to white
    const btns = document.querySelectorAll('button');
    btns.forEach(btn => {
        btn.style.color = 'white';
    });

    // make button borders invisible
    const btns2 = document.querySelectorAll('button');
    btns2.forEach(btn => {
        btn.style.borderColor = 'rgba(0,0,0,0)';
        btn.style.borderColorBottom = 'rgba(0,0,0,0)';
        
    });

    // hide rainbow button
    document.getElementById('rainbow-mode').innerHTML = '<span class="material-symbols-outlined">hotel</span>Boring Mode';
    document.getElementById('rainbow-mode').onclick = boringMode;

    // make button style boring
    document.getElementById('rainbow-mode').classList.remove('rainbow');
    document.getElementById('rainbow-mode').classList.add('disabled');

    document.getElementById('rainbow-mode').style.backgroundColor = '#002145';

}

function boringMode() {

    stopnyancat();
    rainbowModeAct = false;

    // remove rainbow classes from all buttons
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        // except rainbow mode button
        if (button.id !== 'rainbow-mode') {
            button.classList.remove('rainbow');
        }

    });

    // set background color to white
    document.body.style.backgroundColor = 'white';

    // set text color to black
    document.body.style.color = 'black';

    // set h2 color to black
    const h2s = document.querySelectorAll('h2');

    h2s.forEach(h2 => {
        h2.style.color = 'black';
    });

    // set th color to black

    const ths = document.querySelectorAll('th');

    ths.forEach(th => {
        th.style.color = 'black';
    });

    // set td color to black
    const tds = document.querySelectorAll('td');

    tds.forEach(td => {
        td.style.color = 'black';
    });

    // set a color to black
    const as = document.querySelectorAll('a');

    as.forEach(a => {
        a.style.color = 'black';
    });

    // set li color to black
    const lis = document.querySelectorAll('li');

    lis.forEach(li => {
        li.style.color = 'black';
    });

    // hide nyan cat img
    document.getElementById('nyancat').style.display = 'none';

    // reset load more buttons
    const loadMoreButtons = document.querySelectorAll('.load-more-btn');

    loadMoreButtons.forEach(btn => {
        btn.style.color = 'rgb(94, 94, 94)';
        btn.style.borderBottom = '1px solid #ddd';
    }
    );

    // set button back to rainbow mode
    document.getElementById('rainbow-mode').innerHTML = '<span class="material-symbols-outlined">looks</span>Rainbow Mode';
    document.getElementById('rainbow-mode').onclick = rainbowMode;

    document.getElementById('rainbow-mode').classList.add('rainbow');
    document.getElementById('rainbow-mode').classList.remove('disabled');
    
}

function getFileType() {
    var ft = document.getElementById('file-type')
    return ft.value;
}

main();
