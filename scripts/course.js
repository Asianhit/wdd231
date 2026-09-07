const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
        technology: [
            'HTML',
            'CSS'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.',
        technology: [
            'C#'
        ],
        completed: false
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: false
    }
]

// DOM Element References (matching the IDs in index.html)
const courseContainer = document.querySelector('#course-cards');
const totalCreditsElement = document.querySelector('#total-credits');
const allBtn = document.querySelector('#all-btn');
const cseBtn = document.querySelector('#cse-btn');
const wddBtn = document.querySelector('#wdd-btn');

// Render Function to Display Cards
function displayCourses(courseList) {
    // Clear out current cards before building new ones
    courseContainer.innerHTML = '';

    // Dynamically generate an <h4> element for each course
    courseList.forEach(course => {
        const card = document.createElement('h4');
        card.textContent = `${course.subject} ${course.number}`;

        // Add completed class if true for color styling
        if (course.completed) {
            card.classList.add('completed');
        }

        courseContainer.appendChild(card);
    });

    // Update total credits whenever displayed list changes
    calculateTotalCredits(courseList);
}

// Dynamic Credit Calculation using reduce()
function calculateTotalCredits(courseList) {
    const total = courseList.reduce((accumulator, course) => {
        return accumulator + course.credits;
    }, 0);

    totalCreditsElement.textContent = `The total credits for the courses listed above is ${total}.`;
}

// Event Listeners for Filter Buttons
allBtn.addEventListener('click', () => {
    displayCourses(courses);
});

cseBtn.addEventListener('click', () => {
    const cseCourses = courses.filter(course => course.subject === 'CSE');
    displayCourses(cseCourses);
});

wddBtn.addEventListener('click', () => {
    const wddCourses = courses.filter(course => course.subject === 'WDD');
    displayCourses(wddCourses);
});


displayCourses(courses);