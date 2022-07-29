import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/Navbar.module.css";

const Navbar = ({ geoAreas, setHighlighted }) => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    const [query, setQuery] = useState("");
    const [areaMap, setAreaMap] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [searchFocused, setSearchFocused] = useState(false);
    const [suggestionsFocused, setSuggestionsFocused] = useState(false);

    const navbarRef = useRef();

    const gotoGroup = (gid) => {
        document.getElementById(`group${gid}`).scrollIntoView();

        const navbarHeight = navbarRef.current.clientHeight + 10;
        setHighlighted(gid);
        window.scrollBy({ left: 0, top: -1 * navbarHeight, behavior: "smooth" });
    };

    useEffect(() => {
        const tempMap = {};
        Object.entries(geoAreas).forEach(([gid, areas]) => {
            areas.forEach((area) => {
                tempMap[area] = gid;
            });
        });
        setAreaMap(tempMap);
    }, []);

    useEffect(() => {
        setSuggestions(
            Object.keys(areaMap)
                .map((area) => {
                    if (area.toLowerCase().includes(query.toLowerCase())) {
                        return area;
                    } else {
                        return null;
                    }
                })
                .filter((a) => a !== null)
                .slice(0, 5)
        );
    }, [query]);

    return (
        <div ref={navbarRef} className={styles.navbar}>
            <h3 className={styles.title}>powercuts.lk</h3>
            <div className={styles.navlinks}>
                {letters.map((letter) => {
                    return (
                        <a
                            key={letter}
                            className={styles.navlink}
                            href={`#`}
                            data-letter={letter}
                            onClick={(e) => {
                                e.preventDefault();
                                gotoGroup(e.currentTarget.dataset.letter);
                            }}>
                            {letter}
                        </a>
                    );
                })}
            </div>
            <input
                className={styles.search}
                type="text"
                placeholder="Search your location..."
                value={query}
                onChange={(e) => {
                    setSearchFocused(true);
                    setQuery(e.target.value.trim());
                }}
                onFocus={() => {
                    setSearchFocused(true);
                }}
                onBlur={() => {
                    setSearchFocused(false);
                }}
            />
            <div className={query === "" ? styles["suggestions"] : searchFocused || suggestionsFocused ? styles["suggestions-visible"] : styles["suggestions"]}>
                {suggestions.length > 0 ? (
                    suggestions.map((s) => {
                        return (
                            <span
                                className={styles["suggestion-link"]}
                                key={s}
                                data-letter={areaMap[s]}
                                onMouseEnter={() => {
                                    setSuggestionsFocused(true);
                                }}
                                onMouseLeave={() => {
                                    setSuggestionsFocused(false);
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchFocused(false);
                                    gotoGroup(e.currentTarget.dataset.letter);
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    setSearchFocused(false);
                                    gotoGroup(e.currentTarget.dataset.letter);
                                }}>
                                {s}
                            </span>
                        );
                    })
                ) : (
                    <span>No Results</span>
                )}
            </div>
        </div>
    );
};

export default Navbar;
