import React, { FC, useState } from "react";
import { useCreateJiraIssue } from "../hooks/useCreateJiraIssue";

const Home: FC = () => {
  const [projectKey, setProjectKey] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { createIssue, loading, error } = useCreateJiraIssue();

  const handleCreateIssue = async (): Promise<void> => {
   await createIssue(projectKey, summary, description);
  };

  const handleOAuthRedirect = (): void => {
    window.location.href = 'http://localhost:4000/oauth/start'; 
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(e.target.value);
  };
  const handleProjectKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectKey(e.target.value);
  };
  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Jira Issue</h1>
      <input
        type="text"
        placeholder="Project Key"
        value={projectKey}
        onChange={handleProjectKeyChange} 
        style={{ display: 'block', margin: '10px 0' }}
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={handleSummaryChange}
        style={{ display: 'block', margin: '10px 0' }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        style={{ display: 'block', margin: '10px 0', height: '100px' }}
      />
      <button
        onClick={handleCreateIssue}
        style={{ margin: '10px 5px' }}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      <button
        onClick={handleOAuthRedirect}
        style={{ margin: '10px 5px' }}
      >
     Authenticate with Jira
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Home;