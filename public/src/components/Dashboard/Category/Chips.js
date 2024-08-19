"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const tags_1 = require("../../../models/tags");
const react_1 = require("react");
const Chips = ({ tags }) => {
    const [hiddenChipCount, setHiddenChipCount] = (0, react_1.useState)(0);
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!ref.current)
            return;
        const lowestPointAChipCanEndAt = ref.current.getBoundingClientRect().bottom;
        const children = Array.from(ref.current.children);
        if (ref.current.getBoundingClientRect().height > 64) {
            children.forEach((child) => {
                if (child.getBoundingClientRect().bottom > lowestPointAChipCanEndAt) {
                    child.style.display = 'none';
                }
            });
            const hiddenChildren = children.filter((child) => !child.checkVisibility());
            setHiddenChipCount(hiddenChildren.length);
        }
    }, []);
    return ((0, jsx_runtime_1.jsx)(material_1.Badge, { badgeContent: hiddenChipCount, color: "primary", sx: {
            width: '100%',
        }, children: (0, jsx_runtime_1.jsx)(material_1.Stack, { ref: ref, marginTop: 2, spacing: 0.5, direction: "row", flexWrap: "wrap", height: "72px", width: "100%", justifyContent: "flex-end", children: tags.map((recipeTag) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { variant: "outlined", sx: {
                    margin: '2px!important',
                }, label: tags_1.recipeTagChips.find((tag) => tag.recipeTagPropertyName === recipeTag).label, "data-tag": recipeTag }, recipeTag))) }) }));
};
exports.default = Chips;
//# sourceMappingURL=Chips.js.map