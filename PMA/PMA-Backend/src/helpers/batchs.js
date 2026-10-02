const Task = require("../models/task");
const { generateRef } = require("../helpers/tasks.helpers")


async function assignRefToTasks() {
    try {
        const tasks = await Task.find();
        const updatedTasks = tasks.map(async (task) => {
            task.ref = await generateRef();
            return task.save();
        });
        await Promise.all(updatedTasks);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    assignRefToTasks
}