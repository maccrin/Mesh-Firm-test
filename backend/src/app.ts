import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";

dotenv.config({ path: "../.env" });
const app:Application=express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.urlencoded({ extended: false }));

const {CLIENT_ID,CLIENT_SECRET,REDIRECT_URI,JIRA_API_URL}= process.env;

if(!CLIENT_ID|| !CLIENT_SECRET|| !REDIRECT_URI || !JIRA_API_URL){
 
    process.exit(1);
}

let accessToken:string|null;

// OAuth start endpoint
app.get('/oauth/start', (req: Request, res: Response) => {
    const state = (Math.random()+1).toString(36).substring(7);
   
    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${CLIENT_ID}&scope=read:jira-user write:jira-work&redirect_uri=${REDIRECT_URI}&response_type=code&state=${state}`;
    res.redirect(authUrl);
  });

app.get('/oauth/callback', async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  try {
    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'OAuth failed');
    }
    const data = await response.json();
    accessToken = data.access_token as string;
    res.redirect(`http://localhost:3000?access_token=${accessToken}`);

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ status: "Failure", message: `OAuth failed: ${error.message}` });
    } else {
      res.status(500).json({ status: "Failure", message: "An unknown error occurred during OAuth" });
    }
  }
});
interface IssueFields {
  project: {
    key: string;
  };
  summary: string;
  description: {
    type: string;
    version: number;
    content: {
      type: string;
      text: string;
    }[];
  };
  issuetype: {
    name: string;
  };
}
app.post('/create-issue', async (req: Request, res: Response): Promise<void> => {
  const { fields } = req.body as { fields: IssueFields };
  const { project: { key: projectKey }, summary, description, issuetype } = fields;
  const { content, type, version } = description; // Destructure top-level 'description' object
  if (!accessToken) {
    res.status(401).json({ status: "Failure", message: "OAuth authorization is required. Please authenticate first." });
    return;
  }

const payload = {
  fields: {
    project: { key: projectKey },
    summary,
    description, // Use the `description` as-is from the frontend
    issuetype: { name: issuetype.name }
  }
};

  try {
    const response = await fetch(`https://api.atlassian.com/ex/jira/30d19e6a-9fb0-4c20-8dcc-bffb242ac677/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      
      throw new Error(error.errorMessages || 'Failed to create Jira issue.');
    }

    const data = await response.json();
    res.status(200).json({ 
      status: "Success", 
      message: "Jira issue created", 
      id: data.id, 
      key: data.key 
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ status: "Failure", message: `Jira issue creation failed: ${error.message}` });
    } else {
      res.status(500).json({ status: "Failure", message: "An unknown error occurred while creating the Jira issue" });
    }
  }
});

export default app;