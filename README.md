# TaskFlow

<h1 align="center">TASKFLOW</h1>
<h1 align="center">Hi 👋, I'm Nghia</h1>

<h3 align="left">Connect with me:</h3>
<p align="left">
<a href="https://linkedin.com/in/nghianm2803" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="nghianm2803" height="30" width="40" /></a>
</p>

<h3 align="left">Languages and Tools for TASKFLOW:</h3>
<p align="left"> <a href="https://getbootstrap.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/bootstrap/bootstrap-plain-wordmark.svg" alt="bootstrap" width="40" height="40"/> </a> <a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/> </a> <a href="https://expressjs.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40"/> </a> <a href="https://www.figma.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/figma/figma-icon.svg" alt="figma" width="40" height="40"/> </a> <a href="https://git-scm.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" alt="git" width="40" height="40"/> </a> <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/> </a> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" alt="mongodb" width="40" height="40"/> </a> <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> <a href="https://www.photoshop.com/en" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/photoshop/photoshop-line.svg" alt="photoshop" width="40" height="40"/> </a> <a href="https://postman.com" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" alt="postman" width="40" height="40"/> </a> <a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> </a> <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/> </a> </p>

## **Description**

TaskFlow is a cutting-edge web application designed to streamline task management for startup companies. With its intuitive interface, TaskFlow empowers team managers and members to effortlessly create, assign, and track tasks, ensuring everyone stays organized and focused on achieving their goals.

At the core of TaskFlow lies simplicity and efficiency. Team managers can easily create tasks, set due dates, and assign them to specific team members. TaskFlow provides a centralized platform where team members can access their assigned tasks, update their progress, and communicate seamlessly, fostering collaboration and enhancing productivity.

TaskFlow's comprehensive features enable users to break down complex projects into manageable subtasks, set priorities, and track deadlines. Real-time notifications keep everyone informed about task updates, ensuring smooth communication within the team.

With TaskFlow, managing tasks becomes a breeze. Its user-friendly interface requires no extensive training, allowing teams to adapt quickly and focus on what truly matters—delivering outstanding results. By organizing and prioritizing tasks effectively, TaskFlow helps teams meet deadlines, optimize resources, and achieve greater success.

## **Entity Diagram Relationship**

![ERD TASKFLOW](ERD%20TASKFLOW.svg)

### User Authentication
- [x] Manager can create an account and log in/ out of the manager’s app
- [x] Team members cannot register by themselves, but need manager’s email invitation to set up their account.
- [x] After initial setup, team members can login/out of the app using their credentials

### Task Management
- [x] Manager can create a project with title, description, and add tasks to it
- [x] Manager can create new tasks by entering a title, description, and selecting a project.
- [ ] Manager can view projects, tasks in different views (by project, by assignee, by status,…)
- [x] Manager can assign tasks to themselves or to team members by selecting from a list of users
- [ ] Manager can add priority, deadline to the task
- [ ] Team member can view all their assigned tasks in one place
- [ ] Team member can assign task to themselves if the created task doesn’t have an assignee
- [ ] Team member can update the status of their assigned task as they progress

### Team Collaboration
- [ ] Team member can view other members’ tasks
- [ ] Team member and manager can leave comments on other members tasks

### Reminder & Notification
- [ ] Manager can receive email and/or in app notification about task status update by team member
- [ ] Team member can receive receive email and/or in app notification about changes made by their manager to their tasks
