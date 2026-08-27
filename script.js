const SUPABASE_URL = "https://myvgbeousingsroatqfa.supabase.co";
const SUPABASE_KEY = "sb_publishable_2wfB-E08gC7ZlcBZhngh7Q_5iJ-KFi_";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// ELEMENTS
// =========================

const libraryPage =
    document.getElementById("library-page");

const booksContainer =
    document.getElementById("books-container");

const windowsContainer =
    document.getElementById("windows-container");

const homeButton =
    document.getElementById("home-button");

const yaoiButton =
    document.getElementById("yaoi-button");

const danmeiButton =
    document.getElementById("danmei-button");

const randomButton =
    document.getElementById("random-button");

const searchInput =
    document.getElementById("search");
const adminButton =
    document.getElementById("admin-button");

let isAdmin = false;
async function checkAdmin() {

    const {
        data: {
            user
        }
    } = await db.auth.getUser();

    isAdmin =
        user?.email === "nvabarchive.1@gmail.com";

    adminButton.style.display =
        isAdmin ? "inline-block" : "none";
}

// =========================
// RANDOM ELEMENTS
// =========================

const randomPage =
    document.getElementById("random-page");

const randomHomeButton =
    document.getElementById("random-home-button");

const randomResult =
    document.getElementById("random-result");

const randomCloseWarning =
    document.getElementById("random-close-warning");

const randomAgainChoice =
    document.getElementById("random-again-choice");

const randomHomeChoice =
    document.getElementById("random-home-choice");


// =========================
// LIMIT WARNING
// =========================

const limitWarning =
    document.getElementById("limit-warning");

const limitWarningClose =
    document.getElementById("limit-warning-close");


// =========================
// DATA
// =========================

let books = [];


/*
    Every persistent book window lives here.

    Example:

    [
        {
            book: {...},
            element: ...,
            minimized: false
        }
    ]
*/

let openWindows = [];

let activeBookId = null;

let lastRandomBookId = null;


// =========================
// DATABASE
// =========================

async function loadBooks() {

    const { data, error } = await db
        .from("books")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        booksContainer.textContent =
            "Could not load books ❌";

        return;
    }


    books = data;


    console.log(
        "Books loaded:",
        books
    );


    renderBooks(books);
}


// =========================
// RENDER BOOK LIST
// =========================

function renderBooks(bookList) {

    booksContainer.innerHTML = "";


    if (bookList.length === 0) {

        booksContainer.textContent =
            "No books found.";

        return;
    }


    bookList.forEach(book => {

        const row =
            document.createElement("div");


        row.className =
            "book-row";


        row.innerHTML = `
            <strong>
                ${escapeHTML(book.title || "Untitled")}
            </strong>

            <span>
                — ${escapeHTML(book.author || "")}
            </span>

            <span>
                [${escapeHTML(book.type || "")}]
            </span>
        `;


        row.addEventListener(
            "click",
            () => openBook(book)
        );


        booksContainer.appendChild(row);
    });
}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// =========================
// OPEN BOOK
// =========================

function openBook(book) {

    /*
        If this book already has a window,
        simply restore it.

        This does NOT create a duplicate.
    */

    const existing =
        openWindows.find(
            windowData =>
                windowData.book.id === book.id
        );


    if (existing) {

        activateWindow(existing);

        return;
    }


    /*
        Before creating a NEW window,
        check whether the currently active
        window can be moved into the dock.
    */

    const hasActiveWindow =
        openWindows.some(
            windowData =>
                !windowData.minimized
        );


    if (
        hasActiveWindow &&
        !canAddMinimizedBar()
    ) {

        showLimitWarning();

        return;
    }


    /*
        Create the new window.
    */

    const windowData =
        createBookWindow(book);


    openWindows.push(
        windowData
    );


    /*
        The previously active window
        becomes minimized.
    */

    openWindows.forEach(
        windowData => {

            if (
                windowData.book.id !== book.id &&
                !windowData.minimized
            ) {

                minimizeWindow(
                    windowData
                );
            }
        }
    );


    activateWindow(
        windowData
    );
}


// =========================
// CREATE BOOK WINDOW
// =========================

function createBookWindow(book) {

    const windowElement =
        document.createElement("div");


    windowElement.className =
        "book-window active";


    windowElement.innerHTML = `

        <div class="book-window-header">

            <span class="book-window-title">
                ${escapeHTML(book.title || "Untitled")}
            </span>


            <div class="window-controls">

                <button
                    class="minimize-button"
                    title="Minimize"
                >
                    −
                </button>


                <button
                    class="close-button"
                    title="Close"
                >
                    ×
                </button>

            </div>

        </div>


        <div class="book-window-content">

    <h2>
        ${escapeHTML(book.title || "Untitled")}
    </h2>

    <p>
        <strong>Author:</strong>
        ${escapeHTML(book.author || "")}
    </p>

    <p>
        <strong>Type:</strong>
        ${escapeHTML(book.type || "")}
    </p>

    <p>
        ${escapeHTML(book.description || "")}
    </p>


    <div class="admin-editor">

    <hr>

    <h3>Tags</h3>

    <div class="tag-inputs">

        <input
            class="admin-tag"
            data-tag="tag1"
            value="${escapeHTML(book.tag1 || "")}"
            placeholder="Tag 1"
        >

        <input
            class="admin-tag"
            data-tag="tag2"
            value="${escapeHTML(book.tag2 || "")}"
            placeholder="Tag 2"
        >

        <input
            class="admin-tag"
            data-tag="tag3"
            value="${escapeHTML(book.tag3 || "")}"
            placeholder="Tag 3"
        >

        <input
            class="admin-tag"
            data-tag="tag4"
            value="${escapeHTML(book.tag4 || "")}"
            placeholder="Tag 4"
        >

        <input
            class="admin-tag"
            data-tag="tag5"
            value="${escapeHTML(book.tag5 || "")}"
            placeholder="Tag 5"
        >

    </div>


        <h3>Rating</h3>

<div class="star-rating" data-rating="${book.rating ?? 0}">
    <button type="button" class="star" data-value="1">★</button>
    <button type="button" class="star" data-value="2">★</button>
    <button type="button" class="star" data-value="3">★</button>
    <button type="button" class="star" data-value="4">★</button>
    <button type="button" class="star" data-value="5">★</button>
</div>


        <h3>Review</h3>

        <textarea
            class="admin-review"
            placeholder="Write review..."
        >${escapeHTML(book.review || "")}</textarea>


        <button class="save-admin-button">
            Save Changes
        </button>

    </div>

</div>
    `;


    windowsContainer.appendChild(
        windowElement
    );
    // =========================
// STAR RATING
// =========================

const starRating =
    windowElement.querySelector(".star-rating");

const stars =
    windowElement.querySelectorAll(".star");

let currentRating =
    Number(book.rating) || 0;


function updateStars(rating) {

    stars.forEach(star => {

        const value =
            Number(star.dataset.value);

        star.classList.remove(
            "full",
            "half",
            "empty"
        );

        if (value <= rating) {

            star.classList.add("full");

        } else if (value - 0.5 === rating) {

            star.classList.add("half");

        } else {

            star.classList.add("empty");
        }
    });

    starRating.dataset.rating =
        rating;
}


stars.forEach(star => {

    star.addEventListener(
        "click",
        event => {

            const value =
                Number(event.currentTarget.dataset.value);

            const rect =
                event.currentTarget.getBoundingClientRect();

            const clickX =
                event.clientX - rect.left;

            const half =
                clickX < rect.width / 2;

            currentRating =
                half
                    ? value - 0.5
                    : value;

            updateStars(currentRating);
        }
    );
});


updateStars(currentRating);


    const windowData = {

    book: book,

    element: windowElement,

    minimized: false
};


// =========================
// ADMIN SAVE
// =========================

const saveButton =
    windowElement.querySelector(
        ".save-admin-button"
    );

saveButton.addEventListener(
    "click",
    async event => {

        event.stopPropagation();

        if (!isAdmin) {
            return;
        }

        const tagInputs =
            windowElement.querySelectorAll(
                ".admin-tag"
            );

        const updates = {};

        tagInputs.forEach(input => {

            updates[
                input.dataset.tag
            ] = input.value.trim();

        });

        const ratingInput =
            windowElement.querySelector(
                ".admin-rating"
            );

        const reviewInput =
            windowElement.querySelector(
                ".admin-review"
            );

        updates.rating =
            ratingInput.value === ""
                ? null
                : Number(ratingInput.value);

        updates.review =
            reviewInput.value.trim();


        const {
            data,
            error
        } = await db
            .from("books")
            .update(updates)
            .eq("id", book.id)
            .select();


        if (error) {

    console.error(
        "Admin update failed:",
        error.message,
        error.details,
        error.hint,
        error.code
    );

    alert(
        "Could not save changes ❌"
    );

    return;
}


        console.log(
            "Book updated:",
            data
        );


        Object.assign(
            book,
            updates
        );


        saveButton.textContent =
            "Saved ✓";


        setTimeout(
            () => {
                saveButton.textContent =
                    "Save Changes";
            },
            1500
        );
    }
);

    // =========================
    // TITLE BAR
    // =========================

    const header =
        windowElement.querySelector(
            ".book-window-header"
        );


    header.addEventListener(
        "click",
        event => {

            /*
                Buttons have their own behavior.
            */

            if (
                event.target.closest("button")
            ) {
                return;
            }


            activateWindow(
                windowData
            );
        }
    );


    // =========================
    // MINIMIZE
    // =========================

    const minimizeButton =
        windowElement.querySelector(
            ".minimize-button"
        );


    minimizeButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            minimizeWindow(
                windowData
            );
        }
    );


    // =========================
    // CLOSE
    // =========================

    const closeButton =
        windowElement.querySelector(
            ".close-button"
        );


    closeButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            closeWindow(
                windowData
            );
        }
    );


    return windowData;
}


// =========================
// ACTIVATE WINDOW
// =========================

function activateWindow(windowData) {

    /*
        If another book is currently active,
        move THAT book into the dock first.

        This is what gives us:

        Book A active
        ↓
        click Book B
        ↓
        Book A dock
        Book B active
    */

    openWindows.forEach(
        otherWindow => {

            if (
                otherWindow !== windowData &&
                !otherWindow.minimized
            ) {

                minimizeWindow(
                    otherWindow
                );
            }
        }
    );


    /*
        IMPORTANT:

        Clear all old dock positioning.

        Without this, a restored window can
        retain its old bottom/right coordinates.
    */

    windowData.element.style.right =
        "";

    windowData.element.style.bottom =
        "";


    windowData.minimized =
        false;


    windowData.element.classList.remove(
        "minimized"
    );


    windowData.element.classList.add(
        "active"
    );


    windowData.element.style.zIndex =
        "1000";


    activeBookId =
        windowData.book.id;


    /*
        Re-stack the remaining minimized bars
        after restoring this one.
    */

    positionMinimizedWindows();
}


// =========================
// MINIMIZE WINDOW
// =========================

function minimizeWindow(windowData) {

    if (windowData.minimized) {
        return;
    }


    windowData.minimized =
        true;


    windowData.element.classList.remove(
        "active"
    );


    windowData.element.classList.add(
        "minimized"
    );


    /*
        Clear active-window positioning.
    */

    windowData.element.style.left =
        "";

    windowData.element.style.top =
        "";

    windowData.element.style.transform =
        "";


    if (
        activeBookId === windowData.book.id
    ) {

        activeBookId =
            null;
    }


    positionMinimizedWindows();
}


// =========================
// POSITION MINIMIZED WINDOWS
// =========================

function positionMinimizedWindows() {

    const minimized =
        openWindows.filter(
            windowData =>
                windowData.minimized
        );


    const gap = 6;

    const rightMargin = 20;

    const bottomMargin = 20;


    let currentBottom =
        bottomMargin;


    minimized.forEach(
        windowData => {

            const element =
                windowData.element;


            /*
                Make sure the browser has
                measured the actual element.
            */

            const height =
                element.offsetHeight || 32;


            element.style.right =
                `${rightMargin}px`;


            element.style.bottom =
                `${currentBottom}px`;


            element.style.zIndex =
                `${900 + minimized.indexOf(windowData)}`;


            currentBottom +=
                height + gap;
        }
    );
}


// =========================
// CLOSE WINDOW
// =========================

function closeWindow(windowData) {

    windowData.element.remove();


    openWindows =
        openWindows.filter(
            otherWindow =>
                otherWindow !== windowData
        );


    if (
        activeBookId === windowData.book.id
    ) {

        activeBookId =
            null;
    }


    positionMinimizedWindows();
}


// =========================
// SCREEN SPACE CHECK
// =========================

function canAddMinimizedBar() {

    const minimized =
        openWindows.filter(
            windowData =>
                windowData.minimized
        );


    /*
        The new window will cause the
        current active window to become
        another minimized bar.

        If there are no existing bars,
        there is definitely room.
    */

    if (minimized.length === 0) {
        return true;
    }


    const gap = 6;

    const bottomMargin = 20;

    const topMargin = 20;


    let requiredHeight =
        bottomMargin;


    /*
        Measure every existing bar.
    */

    minimized.forEach(
        windowData => {

            const height =
                windowData.element.offsetHeight || 32;


            requiredHeight +=
                height + gap;
        }
    );


    /*
        Estimate the new bar's height.

        We deliberately leave a little room
        rather than letting the final bar
        touch the very top edge.
    */

    const newBarHeight = 32;


    requiredHeight +=
        newBarHeight +
        topMargin;


    return (
        requiredHeight <=
        window.innerHeight
    );
}


// =========================
// MINIMIZE ACTIVE WINDOW
// =========================

function minimizeActiveWindow() {

    const active =
        openWindows.find(
            windowData =>
                !windowData.minimized
        );


    if (active) {

        minimizeWindow(
            active
        );
    }
}


// =========================
// HOME
// =========================

homeButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();


        searchInput.value =
            "";


        renderBooks(
            books
        );
    }
);


// =========================
// YAOI
// =========================

yaoiButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();


        const filtered =
            books.filter(
                book =>
                    book.type
                        ?.toLowerCase() ===
                    "yaoi"
            );


        renderBooks(
            filtered
        );
    }
);


// =========================
// DANMEI
// =========================

danmeiButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();


        const filtered =
            books.filter(
                book =>
                    book.type
                        ?.toLowerCase() ===
                    "danmei"
            );


        renderBooks(
            filtered
        );
    }
);


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Enter") {
            return;
        }

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        // Empty search = show everything again
        if (!query) {

            minimizeActiveWindow();

            renderBooks(books);

            return;
        }


        const filtered =
    books.filter(book => {

        const title =
            book.title
                ?.toLowerCase() || "";

        const author =
            book.author
                ?.toLowerCase() || "";

        return (
            title.includes(query) ||
            author.includes(query)
        );
    });


        // No results
        if (filtered.length === 0) {

            showSearchNotFound();

            return;
        }


        // Results found
        minimizeActiveWindow();

        renderBooks(filtered);
    }
);
function showSearchNotFound() {

    const existing =
        document.getElementById("search-not-found");

    if (existing) {
        return;
    }


    const warning =
        document.createElement("div");

    warning.id =
        "search-not-found";


    warning.innerHTML = `

        <div id="search-not-found-box">

            <button
                id="search-not-found-close"
                aria-label="Close"
            >
                ×
            </button>

            <div id="search-not-found-title">
                NO RESULTS FOUND
            </div>

        </div>
    `;


    document.body.appendChild(warning);


    document
        .getElementById("search-not-found-close")
        .addEventListener(
            "click",
            () => warning.remove()
        );
}

// =========================
// RANDOM PAGE
// =========================

function openRandomPage() {

    /*
        Random is a separate browsing mode.

        The currently active persistent book
        is minimized just like navigation/search.
    */

    minimizeActiveWindow();


    libraryPage.style.display =
        "none";


    randomPage.classList.add(
        "active"
    );
}


// =========================
// RANDOM BOOK
// =========================

function randomBook() {

    if (books.length === 0) {
        return;
    }


    openRandomPage();


    let availableBooks =
        books;


    /*
        Do not immediately repeat
        the previous random result.
    */

    if (
        books.length > 1 &&
        lastRandomBookId !== null
    ) {

        availableBooks =
            books.filter(
                book =>
                    book.id !==
                    lastRandomBookId
            );
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            availableBooks.length
        );


    const book =
        availableBooks[randomIndex];


    lastRandomBookId =
        book.id;


    renderRandomBook(
        book
    );
}


// =========================
// RENDER RANDOM BOOK
// =========================

function renderRandomBook(book) {

    randomResult.innerHTML = `

        <div class="random-window">

            <div class="random-window-header">

                <strong>
                    ${escapeHTML(
                        book.title ||
                        "Untitled"
                    )}
                </strong>


                <button
                    class="random-close-button"
                    id="random-result-close"
                    aria-label="Close random result"
                >
                    ×
                </button>

            </div>


            <div class="random-window-content">

                <h2>
                    ${escapeHTML(
                        book.title ||
                        "Untitled"
                    )}
                </h2>


                <p>
                    <strong>Author:</strong>
                    ${escapeHTML(
                        book.author || ""
                    )}
                </p>


                <p>
                    <strong>Type:</strong>
                    ${escapeHTML(
                        book.type || ""
                    )}
                </p>


                <p>
                    ${escapeHTML(
                        book.description || ""
                    )}
                </p>

            </div>

        </div>
    `;


    const closeButton =
        document.getElementById(
            "random-result-close"
        );


    closeButton.addEventListener(
        "click",
        showRandomCloseWarning
    );
}


// =========================
// RANDOM BUTTON
// =========================

randomButton.addEventListener(
    "click",
    () => {

        randomBook();
    }
);


// =========================
// RANDOM CLOSE POPUP
// =========================

function showRandomCloseWarning() {

    randomCloseWarning.classList.add(
        "active"
    );
}


// =========================
// RANDOM AGAIN
// =========================

randomAgainChoice.addEventListener(
    "click",
    () => {

        randomCloseWarning.classList.remove(
            "active"
        );


        /*
            Same random page.
            Same single result window.
            New book.
        */

        randomBook();
    }
);


// =========================
// RANDOM → HOME
// =========================

randomHomeChoice.addEventListener(
    "click",
    () => {

        randomCloseWarning.classList.remove(
            "active"
        );


        randomResult.innerHTML =
            "";


        randomPage.classList.remove(
            "active"
        );


        libraryPage.style.display =
            "block";
    }
);


// =========================
// RANDOM HOME BUTTON
// =========================

randomHomeButton.addEventListener(
    "click",
    () => {

        randomResult.innerHTML =
            "";


        randomPage.classList.remove(
            "active"
        );


        libraryPage.style.display =
            "block";
    }
);


// =========================
// LIMIT WARNING
// =========================

function showLimitWarning() {

    limitWarning.classList.add(
        "active"
    );
}


limitWarningClose.addEventListener(
    "click",
    () => {

        limitWarning.classList.remove(
            "active"
        );
    }
);


// =========================
// RESIZE
// =========================

window.addEventListener(
    "resize",
    () => {

        positionMinimizedWindows();
    }
);


// =========================
// START
// =========================

checkAdmin();
loadBooks();

adminButton.addEventListener(
    "click",
    () => {

        if (!isAdmin) {
            return;
        }

        document.body.classList.toggle(
            "admin-mode"
        );

        adminButton.textContent =
            document.body.classList.contains(
                "admin-mode"
            )
                ? "Admin ✓"
                : "Admin";
    }
);
document.getElementById("search-button").addEventListener("click", () => {
    window.location.href = "search.html";
});