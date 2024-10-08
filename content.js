// ページのロード後に実行
window.addEventListener('load', function() {
  // Bootstrap Icons のスタイルシートを head に追加
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css';
  document.head.appendChild(link); // head 要素に追加

  // すべてのカートボタンを取得
  const cartButtons = document.querySelectorAll('.add-to-cart__button');

  // ブックマークボタンを作成・追加する関数
  function addBookmarkButton(cartButton) {
    const parentRow = cartButton.closest('tr');

    // ブックマーク用のアイコンを作成
    const bookmarkIcon = document.createElement('i');
    bookmarkIcon.style.cursor = 'pointer'; // ポインタに変更
    bookmarkIcon.style.fontSize = '24px';  // アイコンのサイズを24pxに設定
    bookmarkIcon.classList.add('bookmark-icon', 'bi'); // 固有のクラスを追加

    const bookmarkCell = document.createElement('td');
    bookmarkCell.style.paddingRight = '10px';

    // 必要な値をローカル変数としてキャプチャ
    const itemNumber = cartButton.dataset.id;
    const itemTitle = cartButton.dataset.title;

    // 保存済みかどうかを確認してアイコンを設定
    chrome.storage.sync.get(['bookmarkedItems'], function(result) {
      const bookmarkedItems = result.bookmarkedItems || [];
      const isBookmarked = bookmarkedItems.some(item => item.id === itemNumber);

      // 古いアイコンのクラスを削除
      bookmarkIcon.classList.remove('bi-bookmark', 'bi-bookmark-check-fill');

      if (isBookmarked) {
        bookmarkIcon.classList.add('bi-bookmark-check-fill');  // 保存済みのアイコン
      } else {
        bookmarkIcon.classList.add('bi-bookmark');  // 未保存のアイコン
      }
    });

    // アイコンをクリックしたときの処理
    bookmarkIcon.addEventListener('click', function() {
      chrome.storage.sync.get(['bookmarkedItems'], function(result) {
        let bookmarkedItems = result.bookmarkedItems || [];
        const isBookmarked = bookmarkedItems.some(item => item.id === itemNumber);

        if (isBookmarked) {
          // ブックマークを解除
          bookmarkedItems = bookmarkedItems.filter(item => item.id !== itemNumber);
          bookmarkIcon.classList.remove('bi-bookmark-check-fill');
          bookmarkIcon.classList.add('bi-bookmark');  // 未保存のアイコンに変更
        } else {
          // ブックマークを追加
          bookmarkedItems.push({ id: itemNumber, title: itemTitle });
          bookmarkIcon.classList.remove('bi-bookmark');
          bookmarkIcon.classList.add('bi-bookmark-check-fill');  // 保存済みのアイコンに変更
        }

        // Chromeストレージにブックマークリストを保存
        chrome.storage.sync.set({ bookmarkedItems: bookmarkedItems }, function() {
          console.log('Bookmarks updated:', bookmarkedItems);
        });
      });
    });

    // 新しい列にアイコンを追加して、カートボタンの前に挿入
    bookmarkCell.appendChild(bookmarkIcon);
    parentRow.insertBefore(bookmarkCell, cartButton.parentNode);
  }

  // すべてのカートボタンに対してブックマークボタンを追加
  cartButtons.forEach(cartButton => {
    addBookmarkButton(cartButton);
  });

  // アイコンを更新する関数
  function updateBookmarkIcons() {
    cartButtons.forEach(cartButton => {
      const parentRow = cartButton.closest('tr');
      const bookmarkIcon = parentRow.querySelector('.bookmark-icon'); // 正しいアイコンを取得
      const itemNumber = cartButton.dataset.id;

      // 保存済みかどうかを確認してアイコンを更新
      chrome.storage.sync.get(['bookmarkedItems'], function(result) {
        const bookmarkedItems = result.bookmarkedItems || [];
        const isBookmarked = bookmarkedItems.some(item => item.id === itemNumber);

        // 古いアイコンのクラスを削除
        bookmarkIcon.classList.remove('bi-bookmark', 'bi-bookmark-check-fill');

        if (isBookmarked) {
          bookmarkIcon.classList.add('bi-bookmark-check-fill');  // 保存済みのアイコン
        } else {
          bookmarkIcon.classList.add('bi-bookmark');  // 未保存のアイコン
        }
      });
    });
  }

  // メッセージを受け取ってアイコンを更新
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateIcons') {
      updateBookmarkIcons(); // メッセージを受信したらアイコンを更新
    }
  });
});
