document.addEventListener('DOMContentLoaded', function() {
  const bookmarkList = document.getElementById('bookmarkList');
  const clearButton = document.getElementById('clearBookmarks');
  const downloadCsvButton = document.getElementById('downloadCsv'); // CSVボタン

  // Chromeストレージからブックマークを取得して表示
  chrome.storage.sync.get(['bookmarkedItems'], function(result) {
    const bookmarkedItems = result.bookmarkedItems || [];

    bookmarkedItems.forEach(item => {
      const li = document.createElement('li');
      // ItemIDとタイトルを表示
      li.textContent = `ID: ${item.id} - Title: ${item.title}`;
      bookmarkList.appendChild(li);
    });
  });

  // クリアボタンをクリックしたときの処理
  clearButton.addEventListener('click', function() {
    chrome.storage.sync.remove('bookmarkedItems', function() {
      alert('All bookmarks cleared.');
      bookmarkList.innerHTML = '';

      // content.js にメッセージを送信してアイコンを更新
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateIcons' });
      });
    });
  });

  // CSV出力ボタンをクリックしたときの処理
  downloadCsvButton.addEventListener('click', function() {
    chrome.storage.sync.get(['bookmarkedItems'], function(result) {
      const bookmarkedItems = result.bookmarkedItems || [];

      if (bookmarkedItems.length > 0) {
        let csvContent = "data:text/csv;charset=utf-8,ID,Title\n";
        bookmarkedItems.forEach(function(item) {
          const titleEscaped = `"${item.title.replace(/"/g, '""')}"`;
          csvContent += `${item.id},${titleEscaped}\n`;
        });

        // CSVファイルを生成してダウンロード
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bookmarked_items.csv");
        document.body.appendChild(link);

        link.click(); // 自動的にダウンロードを開始
        document.body.removeChild(link); // リンクを削除

        // content.js にメッセージを送信してアイコンを更新
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'updateIcons' });
        });
      } else {
        alert("No items to download.");
      }
    });
  });
});
