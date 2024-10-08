document.addEventListener('DOMContentLoaded', () => {
  loadBookmarks(); // ブックマークを読み込んで表示

  // 全削除ボタンの処理
  document.getElementById('deleteAll').addEventListener('click', () => {
    const confirmation = confirm('本当に全てのブックマークを削除しますか？');
    if (confirmation) {
      chrome.storage.sync.clear(() => {
        document.getElementById('bookmarkList').innerHTML = '';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.reload(tabs[0].id);
        });
      });
    }
  });

  // CSVエクスポートボタンの処理
  document.getElementById('exportCsv').addEventListener('click', exportBookmarksToCSV);
});

// ブックマークを読み込んで一覧を表示する関数
function loadBookmarks() {
  chrome.storage.sync.get(null, (items) => {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = ''; // 既存のリストをクリア

    for (let id in items) {
      const li = document.createElement('li');
      li.textContent = `${items[id].品番} - ${items[id].タイトル}`;
      bookmarkList.appendChild(li);
    }
  });
}

// ブックマークをCSV形式でエクスポートする関数
function exportBookmarksToCSV() {
  chrome.storage.sync.get(null, (items) => {
    let csvContent = '品番,タイトル\n'; // 正しいカラム名を指定
    for (let id in items) {
      const item = items[id];
      csvContent += `"${item['品番']}","${item['タイトル']}"\n`; // 品番とタイトルを正しく出力
    }

    // BOM (Byte Order Mark) を付加してUTF-8で出力
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.csv';
    a.click();
  });
}
