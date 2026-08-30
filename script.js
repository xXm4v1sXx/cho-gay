const SUPABASE_URL =
    "https://myvgbeousingsroatqfa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_2wfB-E08gC7ZlcBZhngh7Q_5iJ-KFi_";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// =====================================================
// ELEMENTS
// =====================================================

const libraryPage =
    document.getElementById("library-page");

const header =
    document.querySelector("header");

const booksContainer =
    document.getElementById("books-container");

const windowsContainer =
    document.getElementById("windows-container");

const homeButton =
    document.getElementById("home-button");

const libraryHomeButton =
    document.getElementById("library-home-button");

const yaoiButton =
    document.getElementById("yaoi-button");

const danmeiButton =
    document.getElementById("danmei-button");

const randomButton =
    document.getElementById("random-button");

const adminButton =
    document.getElementById("admin-button");

const searchButton =
    document.getElementById("search-button");

const sortAZButton =
    document.getElementById("sort-az");

const sortZAButton =
    document.getElementById("sort-za");

// Random elements

const randomPage =
    document.getElementById("random-page");

const randomHomeButton =
    document.getElementById("random-home-button");

const randomStartButton =
    document.getElementById("random-start-button");

const randomResult =
    document.getElementById("random-result");

const randomCloseWarning =
    document.getElementById("random-close-warning");

const randomAgainChoice =
    document.getElementById("random-again-choice");

const randomHomeChoice =
    document.getElementById("random-home-choice");


// Limit warning

const limitWarning =
    document.getElementById("limit-warning");

const limitWarningClose =
    document.getElementById("limit-warning-close");


// =====================================================
// STATE
// =====================================================

let books = [];

let openWindows = [];

let activeBookId = null;

let lastRandomBookId = null;

let isAdmin = false;

let currentBookList = [];

let currentSort = "";

// =====================================================
// ADMIN CHECK
// =====================================================

async function checkAdmin() {

    if (!adminButton) {
        return;
    }

    const {
        data: {
            user
        }
    } = await db.auth.getUser();

    isAdmin =
        user?.email === "nvabarchive.1@gmail.com";

    adminButton.style.display =
        isAdmin
            ? "inline-block"
            : "none";
}


// =====================================================
// DATABASE
// =====================================================

async function loadBooks() {

    const {
        data,
        error
    } = await db
        .from("books")
        .select("*")
        .order("id", {
            ascending: false
        });

    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        if (booksContainer) {
            booksContainer.textContent =
                "Could not load books ❌";
        }

        return;
    }

    books = data || [];

    console.log(
        "Books loaded:",
        books
    );

    restoreView();
}

function restoreView() {

    const view =
        window.location.hash
            .replace("#", "")
            .toLowerCase();


    if (view === "yaoi") {

        showLibrary(
            books.filter(
                book =>
                    book.type
                        ?.trim()
                        .toLowerCase() ===
                    "yaoi"
            )
        );

        return;
    }


    if (view === "danmei") {

        showLibrary(
            books.filter(
                book =>
                    book.type
                        ?.trim()
                        .toLowerCase() ===
                    "danmei"
            )
        );

        return;
    }


    showHomepage();
}

// =====================================================
// PAGE MODES
// =====================================================

function showHomepage() {

    header.style.display =
        "flex";

    document.querySelector("main").style.display =
        "none";
}

function showLibrary(bookList) {

    header.style.display =
        "none";

    document.querySelector("main").style.display =
        "block";


    currentBookList = [
        ...bookList
    ];

    currentSort = "";


    renderBooks(
        currentBookList
    );
}

// =====================================================
// BOOK LIST
// =====================================================

function renderBooks(bookList) {

    booksContainer.innerHTML = "";

    if (bookList.length === 0) {

        booksContainer.innerHTML = `
            <div class="search-no-results">
                NO BOOKS FOUND
            </div>
        `;

        return;
    }


    bookList.forEach(book => {

        const row =
            document.createElement("div");

        row.className =
            "book-row";


        const compactTags = [
            book.tag1,
            book.tag2,
            book.tag3
        ]
            .filter(Boolean)
            .map(tag => escapeHTML(tag))
            .join(" · ");


        row.innerHTML = `

            <div class="book-row-row">

                <div class="book-row-title">
                    ${escapeHTML(
                        book.title ||
                        "Untitled"
                    )}
                </div>

                <div class="book-row-author">
                    ${escapeHTML(
                        book.author ||
                        ""
                    )}
                </div>

            </div>


            <div class="book-row-row">

                <div class="book-row-type">
                    ${displayType(
                        book.type
                    )}
                </div>

                <div class="book-row-tags">
                    ${compactTags}
                </div>

            </div>

        `;


        row.addEventListener(
            "click",
            () => openBook(book)
        );


        booksContainer.appendChild(
            row
        );
    });
}

function sortBooks(
    bookList,
    direction
) {

    const sorted =
        [
            ...bookList
        ];


    sorted.sort(
        (a, b) => {

            const titleA =
                String(
                    a.title || ""
                ).trim();


            const titleB =
                String(
                    b.title || ""
                ).trim();


            return direction === "az"
                ? titleA.localeCompare(
                    titleB,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                )
                : titleB.localeCompare(
                    titleA,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
        }
    );


    return sorted;
}
if (sortAZButton) {

    sortAZButton.addEventListener(
        "click",
        () => {

            currentSort =
                "az";


            const sortedBooks =
                sortBooks(
                    currentBookList,
                    "az"
                );


            renderBooks(
                sortedBooks
            );
        }
    );
}


if (sortZAButton) {

    sortZAButton.addEventListener(
        "click",
        () => {

            currentSort =
                "za";


            const sortedBooks =
                sortBooks(
                    currentBookList,
                    "za"
                );


            renderBooks(
                sortedBooks
            );
        }
    );
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =====================================================
// DISPLAY TYPE
// =====================================================

function displayType(type) {

    const normalized =
        type?.trim().toLowerCase();

    if (normalized === "yaoi") {
        return "ボーイズラブ";
    }

    if (normalized === "danmei") {
        return "耽美";
    }

    return escapeHTML(
        type || ""
    );
}


// =====================================================
// OPEN BOOK
// =====================================================

function openBook(book) {

    const existing =
        openWindows.find(
            windowData =>
                windowData.book.id ===
                book.id
        );


    if (existing) {

        activateWindow(
            existing
        );

        return;
    }


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


    const windowData =
        createBookWindow(book);


    openWindows.push(
        windowData
    );


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


    activateWindow(
        windowData
    );
}


// =====================================================
// CREATE BOOK WINDOW
// =====================================================

function createBookWindow(book) {

    const windowElement =
        document.createElement("div");

    windowElement.className =
        "book-window active";


    const isYaoi =
        book.type
            ?.trim()
            .toLowerCase() ===
        "yaoi";


    const coverHTML =
        isYaoi && book.cover
            ? `
                <div class="book-cover">

                    <img
                        src="${escapeHTML(
                            book.cover
                        )}"
                        alt="${escapeHTML(
                            book.title ||
                            "Book cover"
                        )}"
                    >

                </div>
            `
            : "";


    windowElement.innerHTML = `

        <div class="book-window-header">

            <span class="book-window-title window-decoration">
                ⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀
            </span>


            <span class="book-window-title window-book-title">
                ${escapeHTML(
                    book.title ||
                    "Untitled"
                )}
            </span>


            <div class="window-controls">

                <button
                    class="minimize-button"
                    title="Minimize"
                    type="button"
                >
                    −
                </button>


                <button
                    class="close-button"
                    title="Close"
                    type="button"
                >
                    ×
                </button>

            </div>

        </div>


        <div class="book-window-content">

            <div class="book-full-view">

                <div class="book-top-section ${isYaoi ? "has-cover" : "no-cover"}">

                    ${coverHTML}


                    <div class="book-information">

                        <h2>
                            ${escapeHTML(
                                book.title ||
                                "Untitled"
                            )}
                        </h2>


                        <p class="book-author">

                            <strong class="book-author-label">
                                Author:
                            </strong>

                            <span class="book-author-value">
                                ${escapeHTML(
                                    book.author ||
                                    ""
                                )}
                            </span>

                        </p>


                        <p class="book-type">

                            <strong class="book-type-label">
                                Type:
                            </strong>

                            <span class="book-type-value">
                                ${displayType(
                                    book.type
                                )}
                            </span>

                        </p>


                        <p class="book-tags-field">

                            <strong class="book-tags-label">
                                Tags:
                            </strong>


                            <span class="book-tags-value">
                                ${renderTagDisplay(
                                    book
                                )}
                            </span>


                            <span class="admin-inline-tags">

                                ${renderTagInput(
                                    "tag1",
                                    book.tag1
                                )}

                                ${renderTagInput(
                                    "tag2",
                                    book.tag2
                                )}

                                ${renderTagInput(
                                    "tag3",
                                    book.tag3
                                )}

                                ${renderTagInput(
                                    "tag4",
                                    book.tag4
                                )}

                                ${renderTagInput(
                                    "tag5",
                                    book.tag5
                                )}

                            </span>

                        </p>


                        <div class="book-rating-display">

                            <h3>
                                Rating:
                            </h3>


                            <div
                                class="display-stars admin-display-stars"
                                data-rating="${Number(
                                    book.rating
                                ) || 0}"
                            >
                                ${renderDisplayStars(
                                    Number(book.rating) || 0
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                <div
                    class="book-description ${
                        isYaoi
                            ? "has-cover"
                            : "no-cover"
                    }"
                >

                    <h3>
                        Description:
                    </h3>


                    <p>
                        ${escapeHTML(
                            book.description ||
                            ""
                        )}
                    </p>

                </div>


                <div class="book-review">

                    <h3>
                        Review:
                    </h3>


                    <p class="book-review-display">
                        ${escapeHTML(
                            book.review ||
                            ""
                        )}
                    </p>


                    <textarea
                        class="admin-inline-review"
                    >${escapeHTML(
                        book.review ||
                        ""
                    )}</textarea>


                    <button
                        class="inline-save-button"
                        type="button"
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>

    `;


    windowsContainer.appendChild(
        windowElement
    );


    const windowData = {

        book: book,

        element: windowElement,

        minimized: false

    };


    setupInlineAdmin(
        windowElement,
        book
    );


    const headerElement =
        windowElement.querySelector(
            ".book-window-header"
        );


    headerElement.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "button"
                )
            ) {
                return;
            }

            activateWindow(
                windowData
            );
        }
    );


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

// =====================================================
// TAG DISPLAY
// =====================================================

function renderTagDisplay(book) {

    return [
        book.tag1,
        book.tag2,
        book.tag3,
        book.tag4,
        book.tag5
    ]
        .filter(Boolean)
        .map(tag => escapeHTML(tag))
        .join(" · ");
}


// =====================================================
// TAG INPUT
// =====================================================

function renderTagInput(
    tagName,
    value
) {

    return `
        <input
            type="text"
            class="admin-inline-tag"
            data-tag="${tagName}"
            value="${escapeHTML(
                value || ""
            )}"
            placeholder="..."
        >
    `;
}

// =====================================================
// DISPLAY STARS
// =====================================================

function renderDisplayStars(rating) {

    let result = "";

    for (let i = 1; i <= 5; i++) {

        let starClass = "display-star";

        if (i <= rating) {

            starClass += " full";

        } else if (i - 0.5 === rating) {

            starClass += " half";

        } else {

            starClass += " empty";
        }


        result += `
            <span
                class="${starClass}"
                data-value="${i}"
            >★</span>
        `;
    }


    return result;
}

// =====================================================
// INLINE ADMIN
// =====================================================

function setupInlineAdmin(
    windowElement,
    book
) {

    const displayStars =
        windowElement.querySelector(
            ".admin-display-stars"
        );

    const tagInputs =
        windowElement.querySelectorAll(
            ".admin-inline-tag"
        );

    const reviewInput =
        windowElement.querySelector(
            ".admin-inline-review"
        );

    const saveButton =
        windowElement.querySelector(
            ".inline-save-button"
        );


    let currentRating =
        Number(book.rating) || 0;


    function updateStars(
        rating
    ) {

        currentRating =
            rating;

        displayStars.dataset.rating =
            rating;

        displayStars.innerHTML =
            renderDisplayStars(
                rating
            );
    }


    displayStars.addEventListener(
        "click",
        event => {

            if (!isAdmin) {
                return;
            }


            const star =
                event.target.closest(
                    ".display-star"
                );


            if (!star) {
                return;
            }


            const value =
                Number(
                    star.dataset.value
                );


            const rect =
                star.getBoundingClientRect();


            const clickPosition =
                event.clientX -
                rect.left;


            currentRating =
                clickPosition <
                rect.width / 2
                    ? value - 0.5
                    : value;


            updateStars(
                currentRating
            );
        }
    );


    saveButton.addEventListener(
        "click",
        async event => {

            event.stopPropagation();


            if (!isAdmin) {
                return;
            }


            const updates = {};


            tagInputs.forEach(
                input => {

                    updates[
                        input.dataset.tag
                    ] =
                        input.value.trim();
                }
            );


            updates.rating =
                currentRating > 0
                    ? currentRating
                    : null;


            updates.review =
                reviewInput.value.trim();


            const {
                data,
                error
            } = await db
                .from("books")
                .update(updates)
                .eq(
                    "id",
                    book.id
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "Admin update failed:",
                    error
                );

                alert(
                    "Could not save changes ❌"
                );

                return;
            }


            Object.assign(
                book,
                data
            );


            const tagDisplay =
                windowElement.querySelector(
                    ".book-tags-value"
                );


            if (tagDisplay) {

                tagDisplay.innerHTML =
                    renderTagDisplay(
                        book
                    );
            }


            const reviewDisplay =
                windowElement.querySelector(
                    ".book-review-display"
                );


            if (reviewDisplay) {

                reviewDisplay.textContent =
                    book.review || "";
            }


            updateStars(
                Number(
                    book.rating
                ) || 0
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


    updateStars(
        currentRating
    );
}

// =====================================================
// ACTIVATE WINDOW
// =====================================================

function activateWindow(
    windowData
) {

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


    positionMinimizedWindows();
}


// =====================================================
// MINIMIZE WINDOW
// =====================================================

function minimizeWindow(
    windowData
) {

    if (
        windowData.minimized
    ) {
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


    windowData.element.style.left =
        "";

    windowData.element.style.top =
        "";

    windowData.element.style.transform =
        "";


    if (
        activeBookId ===
        windowData.book.id
    ) {

        activeBookId =
            null;
    }


    positionMinimizedWindows();
}


// =====================================================
// POSITION MINIMIZED WINDOWS
// =====================================================

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
        (
            windowData,
            index
        ) => {

            const element =
                windowData.element;


            const height =
                element.offsetHeight ||
                32;


            element.style.right =
                `${rightMargin}px`;


            element.style.bottom =
                `${currentBottom}px`;


            element.style.zIndex =
                `${900 + index}`;


            currentBottom +=
                height + gap;
        }
    );
}


// =====================================================
// CLOSE WINDOW
// =====================================================

function closeWindow(
    windowData
) {

    windowData.element.remove();


    openWindows =
        openWindows.filter(
            otherWindow =>
                otherWindow !==
                windowData
        );


    if (
        activeBookId ===
        windowData.book.id
    ) {

        activeBookId =
            null;
    }


    positionMinimizedWindows();
}


// =====================================================
// SCREEN SPACE CHECK
// =====================================================

function canAddMinimizedBar() {

    const minimized =
        openWindows.filter(
            windowData =>
                windowData.minimized
        );


    if (
        minimized.length === 0
    ) {

        return true;
    }


    const gap = 6;

    const bottomMargin = 20;

    const topMargin = 20;


    let requiredHeight =
        bottomMargin;


    minimized.forEach(
        windowData => {

            const height =
                windowData.element
                    .offsetHeight ||
                32;


            requiredHeight +=
                height + gap;
        }
    );


    const newBarHeight =
        32;


    requiredHeight +=
        newBarHeight +
        topMargin;


    return (
        requiredHeight <=
        window.innerHeight
    );
}


// =====================================================
// MINIMIZE ACTIVE WINDOW
// =====================================================

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


// =====================================================
// HOME BUTTON
// =====================================================

homeButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();

        window.location.hash = "";

        showHomepage();
    }
);

// =====================================================
// LIBRARY HOME BUTTON
// =====================================================

if (libraryHomeButton) {

    libraryHomeButton.addEventListener(
        "click",
        () => {

            minimizeActiveWindow();

            showHomepage();
        }
    );
}


// =====================================================
// YAOI BUTTON
// =====================================================

yaoiButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();

        window.location.hash =
            "yaoi";

        const filtered =
            books.filter(
                book =>
                    book.type
                        ?.trim()
                        .toLowerCase() ===
                    "yaoi"
            );

        showLibrary(
            filtered
        );
    }
);

// =====================================================
// DANMEI BUTTON
// =====================================================

danmeiButton.addEventListener(
    "click",
    () => {

        minimizeActiveWindow();

        window.location.hash =
            "danmei";

        const filtered =
            books.filter(
                book =>
                    book.type
                        ?.trim()
                        .toLowerCase() ===
                    "danmei"
            );

        showLibrary(
            filtered
        );
    }
);

// =====================================================
// RANDOM PAGE
// =====================================================

function openRandomPage() {

    minimizeActiveWindow();


    libraryPage.style.display =
        "none";


    randomPage.classList.add(
        "active"
    );
}


function randomBook() {

    if (
        books.length === 0
    ) {

        return;
    }


    let availableBooks =
        books;


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
        availableBooks[
            randomIndex
        ];


    lastRandomBookId =
        book.id;


    renderRandomBook(
        book
    );
}


// =====================================================
// RANDOM RESULT
// =====================================================
// NOTE:
// This section is intentionally read-only.
// Admin Mode does NOT affect Random.
// =====================================================

function renderRandomBook(book) {

    const isYaoi =
        book.type
            ?.trim()
            .toLowerCase() ===
        "yaoi";


    const coverHTML =
        isYaoi && book.cover
            ? `
                <div class="book-cover">

                    <img
                        src="${escapeHTML(
                            book.cover
                        )}"
                        alt="${escapeHTML(
                            book.title ||
                            "Book cover"
                        )}"
                    >

                </div>
            `
            : "";


    const tags = [
        book.tag1,
        book.tag2,
        book.tag3,
        book.tag4,
        book.tag5
    ]
        .filter(Boolean)
        .map(
            tag => escapeHTML(tag)
        )
        .join(" · ");


    randomResult.innerHTML = `

        <div class="random-window">

            <div class="random-window-header">

                <span class="window-decoration">
                    ⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀
                </span>

                <span class="window-book-title">
                    ${escapeHTML(
                        book.title ||
                        "Untitled"
                    )}
                </span>


                <button
                    class="random-close-button"
                    id="random-result-close"
                    aria-label="Close random result"
                    type="button"
                >
                    ×
                </button>

            </div>


            <div class="random-window-content">

                <div class="book-full-view">

                    <div class="book-top-section">

                        ${coverHTML}


                        <div class="book-information">

                            <h2>
                                ${escapeHTML(
                                    book.title ||
                                    "Untitled"
                                )}
                            </h2>


                            <p class="book-author">

                                <strong class="book-author-label">
                                    Author:
                                </strong>

                                <span class="book-author-value">
                                    ${escapeHTML(
                                        book.author ||
                                        ""
                                    )}
                                </span>

                            </p>


                            <p class="book-type">

                                <strong class="book-type-label">
                                    Type:
                                </strong>

                                <span class="book-type-value">
                                    ${displayType(
                                        book.type
                                    )}
                                </span>

                            </p>


                            ${
                                tags
                                    ? `
                                        <p class="book-tags-field">

                                            <strong class="book-tags-label">
                                                Tags:
                                            </strong>

                                            <span class="book-tags-value">
                                                ${tags}
                                            </span>

                                        </p>
                                    `
                                    : ""
                            }


                            <div class="book-rating-display">

                            <h3>
                                Rating:
                            </h3>


                            <div
                                class="display-stars admin-display-stars"
                                data-rating="${Number(
                                    book.rating
                                ) || 0}"
                            >
                                ${renderDisplayStars(
                                    Number(book.rating) || 0
                                )}
                            </div>

                        </div>


                        </div>

                    </div>


                    <div
                        class="book-description ${
                            isYaoi && book.cover
                                ? "has-cover"
                                : "no-cover"
                        }"
                    >

                        <h3>
                            Description:
                        </h3>


                        <p>
                            ${escapeHTML(
                                book.description ||
                                ""
                            )}
                        </p>

                    </div>


                    <div class="book-review">

                        <h3>
                            Review:
                        </h3>


                        <p>
                            ${escapeHTML(
                                book.review ||
                                ""
                            )}
                        </p>

                    </div>

                </div>

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


    randomPage.classList.add(
        "has-result"
    );
}


// =====================================================
// RANDOM BUTTON
// =====================================================

randomButton.addEventListener(
    "click",
    () => {

        openRandomPage();
    }
);


// =====================================================
// RANDOM START
// =====================================================

randomStartButton.addEventListener(
    "click",
    () => {

        randomBook();
    }
);


// =====================================================
// RANDOM CLOSE WARNING
// =====================================================

function showRandomCloseWarning() {

    randomCloseWarning.classList.add(
        "active"
    );
}


// =====================================================
// RANDOM AGAIN
// =====================================================

randomAgainChoice.addEventListener(
    "click",
    () => {

        randomCloseWarning.classList.remove(
            "active"
        );

        randomBook();
    }
);


// =====================================================
// RANDOM → HOME
// =====================================================

randomHomeChoice.addEventListener(
    "click",
    () => {

        randomCloseWarning.classList.remove(
            "active"
        );


        randomResult.innerHTML =
            "";


        randomPage.classList.remove(
            "has-result"
        );


        randomPage.classList.remove(
            "active"
        );


        libraryPage.style.display =
            "block";


        showHomepage();
    }
);


// =====================================================
// RANDOM HOME BUTTON
// =====================================================

randomHomeButton.addEventListener(
    "click",
    () => {

        randomResult.innerHTML =
            "";


        randomPage.classList.remove(
            "has-result"
        );


        randomPage.classList.remove(
            "active"
        );


        libraryPage.style.display =
            "block";


        showHomepage();
    }
);


// =====================================================
// LIMIT WARNING
// =====================================================

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


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        positionMinimizedWindows();
    }
);


// =====================================================
// ADMIN BUTTON
// =====================================================

adminButton.addEventListener(
    "click",
    () => {

        if (!isAdmin) {
            return;
        }


        document.body.classList.toggle(
            "admin-mode"
        );


        const buttonLabel =
            adminButton.querySelector(
                ".button-label"
            );


        if (buttonLabel) {

            buttonLabel.textContent =
                document.body.classList.contains(
                    "admin-mode"
                )
                    ? "ulti ✓"
                    : "ulti";
        }
    }
);


// =====================================================
// SEARCH BUTTON
// =====================================================

searchButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "search.html";
    }
);

// =====================================================
// START
// =====================================================

showHomepage();

checkAdmin();

loadBooks();