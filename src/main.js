fetch('data.json').then((response) => response.json()).then((items) => {
  const slider = document.getElementById('slider');
  const grid = document.getElementById('grid');
  const bookmark_movies = document.getElementById('bookmark_movies');
  const bookmark_tv = document.getElementById('bookmark_tv');

  const searchBar = document.getElementById("search-bar");


  const currentCategory = window.currentCategory || "All";


  function updateActiveIcon(category) {
    // D’abord remettre tous les icons en version "inactive"
    document.querySelector('img[alt="home"]').src = "assets/images/icon-nav-home.svg";
    document.querySelector('img[alt="movie"]').src = "assets/images/icon-nav-movies.svg";
    document.querySelector('img[alt="tv"]').src = "assets/images/icon-nav-tv-series.svg";
    document.querySelector('img[alt="bookmark"]').src = "assets/images/icon-nav-bookmark.svg";

    // changer l'icône active selon la catégorie
    switch(category) {
      case "All": // page principale
        document.querySelector('img[alt="home"]').src = "assets/images/icon-nav-home-red.svg";
        break;
      case "Movie":
        document.querySelector('img[alt="movie"]').src = "assets/images/icon-nav-movies-red.svg";
        break;
      case "TV Series":
        document.querySelector('img[alt="tv"]').src = "assets/images/icon-nav-tv-series-red.svg";
        break;
      case "bookmarks":
        document.querySelector('img[alt="bookmark"]').src = "assets/images/icon-nav-bookmark-red.svg";
        break;
    }
  }

// Appelle ça dans ton script principal
  updateActiveIcon(window.currentCategory);

// Fonction pour créer une carte (image + infos + bookmark)
  function createCard(item, isTrending = false) {
    const picture = document.createElement('picture');

    const sourceLarge = document.createElement('source');
    sourceLarge.media = "(min-width: 1024px)";
    sourceLarge.srcset = item.thumbnail.regular.large;

    const sourceMedium = document.createElement('source');
    sourceMedium.media = "(min-width: 768px)";
    sourceMedium.srcset = item.thumbnail.regular.medium;

    const sourceSmall = document.createElement('source');
    sourceSmall.media = "(max-width: 767px)";
    sourceSmall.srcset = item.thumbnail.regular.small;

    const img = document.createElement('img');
    img.src = item.thumbnail.regular.small;
    img.alt = item.title;
    img.className = 'w-full h-36 sm:h-44 md:h-52 object-cover rounded-lg';

    picture.appendChild(sourceLarge);
    picture.appendChild(sourceMedium);
    picture.appendChild(sourceSmall);
    picture.appendChild(img);

    const card = document.createElement('div');
    card.className = isTrending
        ? 'relative snap-start w-64 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer'
        : 'relative rounded-lg overflow-hidden cursor-pointer';

    card.appendChild(picture);

    // Bookmark icon
    const bookmark = document.createElement('div');
    bookmark.className = 'absolute right-3 top-3 bg-black bg-opacity-50 p-2 rounded-full';

    const bookImg = document.createElement('img');
    bookImg.src = item.isBookmarked
        ? "assets/images/icon-bookmark-full.svg"
        : "assets/images/icon-bookmark-empty.svg";

    bookmark.appendChild(bookImg);
    card.appendChild(bookmark);

    // Infos (year, category, rating)
    const infoBox = document.createElement('div');
    infoBox.className = isTrending
        ? 'absolute bottom-3 left-3 right-3 p-3 flex flex-col gap-1 text-sm text-white'
        : 'p-4';

    const meta = document.createElement('div');
    meta.className = 'flex gap-2 text-gray-300 items-center';

    const yearSpan = document.createElement('span');
    yearSpan.textContent = item.year;

    const dot1 = document.createTextNode('•');

    const categoryImg = document.createElement('img');
    categoryImg.className = 'w-4 h-4 inline-block';

    if (item.category === "Movie") {
      categoryImg.src = "assets/images/icon-category-movie.svg";
    } else if (item.category === "TV Series") {
      categoryImg.src = "assets/images/icon-category-tv.svg";
    }

    const categorySpan = document.createElement('span');
    categorySpan.textContent = item.category;

    const dot2 = document.createTextNode('•');

    const ratingSpan = document.createElement('span');
    ratingSpan.textContent = item.rating;

    meta.appendChild(yearSpan);
    meta.appendChild(dot1);
    meta.appendChild(categoryImg);
    meta.appendChild(categorySpan);
    meta.appendChild(dot2);
    meta.appendChild(ratingSpan);

    const title = document.createElement('h3');
    title.textContent = item.title;
    title.className = 'font-semibold text-white truncate';

    infoBox.appendChild(meta);
    infoBox.appendChild(title);

    card.appendChild(infoBox);

    return card;
  }

// Fonction d’affichage
  function displayItems() {
    if (currentCategory === "bookmarks") {
      // Page bookmark : on affiche uniquement les bookmarkés, séparés par type
      items.forEach(item => {
        if (item.isBookmarked) {
          if (item.category === "Movie" && bookmark_movies) {
            bookmark_movies.appendChild(createCard(item));
          } else if (item.category === "TV Series" && bookmark_tv) {
            bookmark_tv.appendChild(createCard(item));
          }
        }
      });
    } else {
      // Page principale ou par catégorie
      items.forEach(item => {
        // Filtrer par catégorie si besoin
        if (currentCategory !== "All" && item.category !== currentCategory) return;

        if (item.isTrending && slider) {
          slider.appendChild(createCard(item, true));
        } else if (grid) {
          grid.appendChild(createCard(item, false));
        }
      });
    }
  }

  displayItems();

  const resultCount = document.createElement('p');
  resultCount.id="resultCount";
  resultCount.className = "text-white text-lg my-3";

  grid.parentNode.insertBefore(resultCount, grid);

  function displayItem(filteredItems) {
    grid.innerHTML = ""; // On vide le conteneur avant d’ajouter les nouveaux résultats

    if (filteredItems.length === 0) {
      // Si aucun résultat, on affiche un message
      const msg = document.createElement("p");
      msg.textContent = "No results found.";
      msg.className = "text-white text-center col-span-full";
      grid.appendChild(msg);
      return;
    }

    // Sinon, on affiche chaque carte
    filteredItems.forEach(item => {

      grid.appendChild(createCard(item, false));


    });
  }

  function filterItems(query) {
    const resultCount = document.getElementById("resultCount");

    let filtered = items;

    // 1. Si c’est la page "Bookmarks", on garde que ceux qui sont bookmarkés
    if (currentCategory === "bookmarks") {
      filtered = filtered.filter(item => item.isBookmarked);
    }

    // 2. Si on est sur la page "Movie" ou "TV Series", on filtre par catégorie
    if (currentCategory === "Movie" || currentCategory === "TV Series") {
      filtered = filtered.filter(item => item.category === currentCategory);
    }

    // 3. Si l’utilisateur tape quelque chose dans la barre de recherche
    if (query.trim() !== "") {
      filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
      );

      if(slider) slider.style.display = "none";

      resultCount.textContent = `Found ${filtered.length} result${filtered.length!==1 ? "s" : ""} for '${query}'`;
    }else{
      if(slider) slider.style.display = "flex";

      resultCount.textContent = "";
    }

    displayItem(filtered); // On affiche les éléments filtrés
  }

  searchBar.addEventListener("input", () => {
    filterItems(searchBar.value);
  });

  filterItems(""); // Charge tous les items au départ (sans filtre texte)
})