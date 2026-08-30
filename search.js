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

const searchInput =
    document.getElementById("search-page-input");

const searchResults =
    document.getElementById("search-results");

const homeButton =
    document.getElementById("search-home-button");


// =====================================================
// DATA
// =====================================================

let books = [];

let openWindows = [];


// =====================================================
// LOAD BOOKS
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

        searchResults.textContent =
            "Could not load books ❌";

        return;
    }


    books =
        data || [];


    console.log(
        "Books loaded:",
        books
    );
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
// SEARCH
// =====================================================

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


        searchResults.innerHTML =
            "";


        if (!query) {
            return;
        }


        const results =
            books.filter(
                book => {

                    const title =
                        String(
                            book.title || ""
                        ).toLowerCase();


                    const author =
                        String(
                            book.author || ""
                        ).toLowerCase();


                    const type =
                        String(
                            book.type || ""
                        ).toLowerCase();


                    const tags = [
                        book.tag1,
                        book.tag2,
                        book.tag3,
                        book.tag4,
                        book.tag5
                    ]
                        .filter(Boolean)
                        .map(
                            tag =>
                                String(tag)
                                    .toLowerCase()
                        )
                        .join(" ");


                    return (
                        title.includes(query) ||
                        author.includes(query) ||
                        type.includes(query) ||
                        tags.includes(query)
                    );
                }
            );


        renderResults(
            results
        );
    }
);


// =====================================================
// RENDER RESULTS
// =====================================================

function renderResults(results) {

    searchResults.innerHTML = "";


    if (results.length === 0) {

        searchResults.innerHTML = `
            <div class="search-no-results">
                NO RESULTS FOUND
            </div>
        `;

        return;
    }


    results.forEach(book => {

        const result =
            document.createElement("div");

        result.className =
            "search-result";


        const compactTags = [
            book.tag1,
            book.tag2,
            book.tag3
        ]
            .filter(Boolean)
            .map(tag => escapeHTML(tag))
            .join(" · ");


        result.innerHTML = `

            <div class="search-result-row">

                <div class="search-result-title">
                    ${escapeHTML(
                        book.title ||
                        "Untitled"
                    )}
                </div>

                <div class="search-result-author">
                    ${escapeHTML(
                        book.author ||
                        ""
                    )}
                </div>

            </div>


            <div class="search-result-row">

                <div class="search-result-type">
                    ${displayType(
                        book.type
                    )}
                </div>

                <div class="search-result-tags">
                    ${compactTags}
                </div>

            </div>

        `;


        result.addEventListener(
            "click",
            () => {
                openBook(book);
            }
        );


        searchResults.appendChild(
            result
        );
    });
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


    const windowData =
        createBookWindow(
            book
        );


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
        book.type?.trim().toLowerCase() ===
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
            tag =>
                escapeHTML(tag)
        )
        .join(" · ");


    windowElement.innerHTML = `

        <div class="book-window-header">

            <span class="window-decoration">
            ⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ ⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ⠀⚞^. .^⚟⌞ ⌝ᵎᵎ.ᐟ.ᐟ
            </span>


            <span class="window-book-title">
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


                            <div class="display-stars">
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

    `;


    document.body.appendChild(
        windowElement
    );


    const windowData = {

        book: book,

        element: windowElement,

        minimized: false

    };


    const header =
        windowElement.querySelector(
            ".book-window-header"
        );


    header.addEventListener(
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
// DISPLAY STARS
// =====================================================

function renderDisplayStars(rating) {

    let result = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        let starClass =
            "display-star";


        if (
            i <= rating
        ) {

            starClass += " full";

        } else if (
            i - 0.5 === rating
        ) {

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


    positionMinimizedWindows();
}


// =====================================================
// HOME
// =====================================================

if (homeButton) {

    homeButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";
        }
    );

}

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
// START
// =====================================================

loadBooks();