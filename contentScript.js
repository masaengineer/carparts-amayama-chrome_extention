window.addEventListener('load', () => {
  // Bootstrap Icons のスタイルシートを head に追加
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css';
  document.head.appendChild(link); // head 要素に追加

  // すべてのカートボタンを探す
  const cartButtons = document.querySelectorAll('.add-to-cart__button');

  cartButtons.forEach((cartButton) => {
    // 商品IDを取得
    const productId = getProductId(cartButton);

    // ブックマークアイコンを作成
    const bookmarkIcon = document.createElement('button');
    bookmarkIcon.classList.add('bookmark-button');
    bookmarkIcon.innerHTML = getBookmarkIcon(false); // 初期状態は未ブックマーク

    // 新しい<td>要素を作成して、ブックマークボタンを追加
    const bookmarkTd = document.createElement('td');
    bookmarkTd.classList.add('entriesTable__bookmark');
    bookmarkTd.appendChild(bookmarkIcon);

    // カートボタンがある<td>要素を取得し、その前に挿入
    const cartTd = cartButton.closest('td');
    cartTd.parentNode.insertBefore(bookmarkTd, cartTd);

    // ブックマーク状態をチェックしてアイコンを設定
    checkBookmarkStatus(productId, bookmarkIcon);

    // アイコンがクリックされたときの処理
    bookmarkIcon.addEventListener('click', () => {
      toggleBookmark(productId, bookmarkIcon);
    });
  });
});

// 商品のIDを取得する関数（URLやカートボタンの位置から取得）
function getProductId(cartButton) {
  const productRow = cartButton.closest('tr'); // カートボタンがある行を取得
  return productRow ? productRow.querySelector('.entriesTable__number').textContent.trim() : window.location.pathname.split('/').pop();
}

// ブックマークの状態を確認してアイコンを設定する関数
function checkBookmarkStatus(productId, icon) {
  chrome.storage.sync.get([productId], (result) => {
    if (result[productId]) {
      // ブックマーク済みのアイコンを設定
      icon.innerHTML = getBookmarkIcon(true);
    } else {
      // 未ブックマークのアイコンを設定
      icon.innerHTML = getBookmarkIcon(false);
    }
  });
}

// ブックマークを切り替える関数
function toggleBookmark(productId, icon) {
  console.log(`toggleBookmark called for product ID: ${productId}`);

  // カートボタンと同じ行を取得
  const productRow = icon.closest('tr');

  // 親のテーブルからタイトルが含まれている groupHeader を取得
  const groupHeaderElement = productRow.closest('table').querySelector('.entriesPncTable__groupHeader');

  // 要素が見つからない場合はエラーハンドリング
  if (!groupHeaderElement) {
    console.error(`Group header element not found for product ID: ${productId}`);
    return; // 何もしないで終了
  }

  // 正しいタイトルを取得
  const title = groupHeaderElement.textContent.trim();
  console.log(`Product Title found: ${title}`);

  chrome.storage.sync.get([productId], (result) => {
    if (result[productId]) {
      // ブックマーク解除
      chrome.storage.sync.remove([productId], () => {
        icon.innerHTML = getBookmarkIcon(false);
        console.log(`Bookmark removed for product ID: ${productId}`);
      });
    } else {
      // ブックマーク追加
      chrome.storage.sync.set({ [productId]: { '品番': productId, 'タイトル': title } }, () => {
        icon.innerHTML = getBookmarkIcon(true);
        console.log(`Bookmark added: {品番: ${productId}, タイトル: ${title}}`);
      });
    }
  });
}


// アイコンのHTMLを返す関数
function getBookmarkIcon(isBookmarked) {
  return isBookmarked ? '<i class="bi bi-bookmark-check-fill"></i>' : '<i class="bi bi-bookmark"></i>';
}
