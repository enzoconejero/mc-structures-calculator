function on_load() {
    console.log("OnLoad")
    let inputs = document.querySelectorAll("input[type=number]")
    console.log("Inputs " + inputs)
    inputs.forEach((i) => {
        // console.log(i)
        i.addEventListener("change", update_and_refresh_canvas)
    })
    canvas.render()
}

function update_and_refresh_canvas() {
    // diams
    const penta = +document.querySelector("#pentagon").value
    const petals = +document.querySelector("#petal").value
    const core = +document.querySelector("#core").value

    const side = (penta + petals) + 2
    canvas
        .clean()
        .resize(side)
        .add_circle(canvas.center(), penta)
        // .add_circle(canvas.center(), core)
        .render()
}

function _distance(p1, p2) {
    // Euclidean distance
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

class Canvas {
    constructor(side_len) {
        this.side_len = Math.ceil(side_len)
        this.figs = []
    }

    resize(side_len) {
        this.side_len = side_len
        return this
    }

    clean() {
        this.figs = []
        return this
    }

    render() {
        let new_cavas = document.createElement("div")
        new_cavas.id = "canvas"

        for (let row = 0; row < this.side_len; row++) {
            // console.log('Printing row ' + row)
            let _row = document.createElement("div")
            _row.id = "row" + row
            _row.classList.add("row")
            for (let col = 0; col < this.side_len; col++) {
                // console.log('Printing col ' + col)
                let _cell = new Cell(col, row)
                _row.appendChild(_cell.html())
            }
            new_cavas.appendChild(_row)
        }
        document.querySelector("#canvas").replaceWith(new_cavas)

        this.figs.forEach((f) => f.render())
        return this
    }

    center() {
        return new Point(this.side_len / 2, this.side_len / 2)
    }

    add_circle(center_point, diam) {
        let c = new Circle(center_point, diam)
        this.figs.push(c)
        return this
    }
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    distance(other) {
        return _distance(this, other)
    }
}

class Cell {
    constructor(x, y) {
        // start coordinate (relative 0, 0)
        this.col = Math.floor(x)
        this.row = Math.floor(y)
        this.zero = new Point(this.col, this.row)  // Start poistion: left bottom
        this.center = new Point(x + 0.5, y + 0.5)
    }

    html() {
        const cell = document.createElement("div")
        cell.classList = "cell"
        cell.id = this.id()
        return cell
    }

    id() {
        return "cell" + this.col + '-' + this.row
    }

    elem() {
        return document.querySelector("#" + this.id())
    }

    // Get the relative cell
    move(x, y) {
        return new Cell(this.col + x, this.row + y)
    }

    equals(other) {
        return this.col == other.col && this.row == other.row
    }

    distance(other) {
        return _distance(this.center, other.center)
    }
}

class Circle {
    constructor(center_point, diam) {
        // The center is either a single cell or the intersection between 4
        this.center_point = center_point
        this.diam = diam
    }

    render() {
        const radius = this.diam / 2
        const has_symetry_cell = (this.diam % 2) != 0
        const symetry_offset = has_symetry_cell ? 0 : 1
        console.log("Diameter: " + this.diam + ". Has symetry: " + has_symetry_cell)

        const main_center_cell = new Cell(this.center_point.x, this.center_point.y)
        let centers, reference_center_point

        if (has_symetry_cell){
            // The center is within the center of a cell
            centers = [main_center_cell]
            reference_center_point = main_center_cell.center
        }
        else {
            centers = [
                main_center_cell,
                main_center_cell.move(-1, 0),
                main_center_cell.move(0, 1),
                main_center_cell.move(-1, 1)
            ]
            reference_center_point = main_center_cell.zero
        }
        
        centers.forEach((c) => {
            c.elem().classList.add("center")
        })

        let left_cell = new Cell(reference_center_point.x - radius, reference_center_point.y)
        let top_cell = new Cell(reference_center_point.x - symetry_offset, reference_center_point.y - radius)
        let cells = [left_cell]

        const end = top_cell
        let last = left_cell

        // First quarter
        while (!last.equals(end)) {
            // possible nexts: top, top right, right
            let next
            let possibles_next = [last.move(0, -1), last.move(1, -1), last.move(1, 0)]
            for (let possible of possibles_next) {
                let distance = possible.center.distance(reference_center_point)
                if (distance <= radius) {
                    next = possible
                    break
                }
            }

            cells.push(next)
            last = next
        }

        // Mirror q2 (symetry on this.center.x) times
        // If has symetry column dont duplicate axis cell

        let to_mirror = [...cells]
        if (has_symetry_cell) {
            to_mirror.pop()
        }
        to_mirror.reverse()

        let q2 = to_mirror.map((cell) => {
            let dist_to_center = Math.ceil(Math.abs(this.center_point.x - cell.center.x))
            return cell.move(dist_to_center * 2 - symetry_offset, 0)
        })

        cells = cells.concat(q2)

        to_mirror = [...cells]
        if (has_symetry_cell) {
            to_mirror.pop()
            to_mirror.shift()
        }
        to_mirror.reverse()

        let q34 = to_mirror.map((cell) => {
            let dist_to_center = Math.ceil(Math.abs(this.center_point.y - cell.center.y))
            return cell.move(0, dist_to_center * 2 + symetry_offset)
        })

        cells = cells.concat(q34)

        // let cells = q1.concat(q2).concat(q34)

        cells.forEach((c) => {
            c.elem().classList.add("border")
        })

        for (let i = 0; i < cells.length; i++){
            cells[i].elem().textContent = i
        }
    }
}

const canvas = new Canvas(20)
