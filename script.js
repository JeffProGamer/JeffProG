document.getElementById('downloadBtn').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = 'game.bat'; // URL to the game file, or path to the game file in your project
    link.download = 'game.bat'; // Name of the file to download
    link.click();
});
