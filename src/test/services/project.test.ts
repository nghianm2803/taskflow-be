import Project from "../../models/Project";
import projectController, {
  createProject,
  deleteProject,
  getSingleProject,
  updateProject,
} from "../../controllers/project.controller";
import * as dbHelper from "../db-helper";

const nonExistingProjectId = "5e57b77b5744fa0b461c7906";

async function createMovie() {
  const project = new Project({
    name: "Complete test for project",
    description: "Implement jest test",
  });
  return await projectController.createProject(project);
}

describe("Project service", () => {
  beforeEach(async () => {
    await dbHelper.connect();
  });

  afterEach(async () => {
    await dbHelper.clearDatabase();
  });

  afterAll(async () => {
    await dbHelper.closeDatabase();
  });

  it("should create a project", async () => {
    const project = await createProject();
    expect(project).toHaveProperty("_id");
    expect(project).toHaveProperty("name", "Complete test for project");
    expect(project).toHaveProperty("description", "Implement jest test");
  });

  it("should get a project with id", async () => {
    const project = await createMovie();
    const found = await getSingleProject(project._id);
    expect(found.name).toEqual(project.name);
    expect(found._id).toEqual(project._id);
  });

  // Check https://jestjs.io/docs/en/asynchronous for more info about
  // how to test async code, especially with error
  it("should not get a non-existing project", async () => {
    expect.assertions(1);
    return getSingleProject(nonExistingProjectId).catch((e) => {
      expect(e.message).toMatch(`Project ${nonExistingProjectId} not found`);
    });
  });

  it("should update an existing project", async () => {
    const project = await createProject();
    const update = {
      name: "Update test for project",
      description: "Finish jest test",
    };
    const updated = await updateProject(project._id, update);
    expect(updated).toHaveProperty("_id", project._id);
    expect(project).toHaveProperty("name", "Update test for project");
    expect(project).toHaveProperty("description", "Finish jest test");
  });

  it("should not update a non-existing project", async () => {
    expect.assertions(1);
    const update = {
      name: "Update test for project",
      description: "Finish jest test",
    };
    return projectController.update(nonExistingProjectId, update).catch((e) => {
      expect(e.message).toMatch(`Project ${nonExistingProjectId} not found`);
    });
  });

  it("should delete an existing project", async () => {
    expect.assertions(1);
    const project = await createMovie();
    await deleteProject(project._id);
    return projectController.findById(project._id).catch((e) => {
      expect(e.message).toBe(`Project ${project._id} not found`);
    });
  });
});

