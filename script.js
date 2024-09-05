document.getElementById('downloadBtn').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'MyProject2.uproject'; // URL to the game file, or path to the game file in your project
    link.download = 'MyProject2.uproject'; // Name of the file to download
    link.click();
});
