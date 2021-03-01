

const appear = (faded, classToAdd) => {
    faded.forEach((el => el.classList.add(classToAdd)))
}

module.exports = appear;