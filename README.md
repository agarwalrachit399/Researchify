# Researchify

Researchify is LLM Powered Web Application to aid scientific research and discovery.

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Features](#features)
3. [Technologies Used](#tech-stack)
4. [Getting Started](#getting-started)


### Architectural Overview

![Project Logo](ResearchApp.drawio.svg)


## Features
- 🔍 Search in Natural Language or use existing description or abstracts
- 🔍 Search Similar Papers based on a seed paper
- 👀 View the paper in pdf format within the browser
- 📝 Ask any questions about the research paper
- 📊 Visualize the reference graph of the paper

## Tech Stack

- **API**: [Semantic Scholar](https://www.semanticscholar.org/), [Cohere](https://cohere.com/), [OpenAI)](https://openai.com/)
- **Database**: [ChromaDB](https://www.trychroma.com/)
- **Indexing and Retrieval**: [Copali](https://huggingface.co/vidore/colpali)
- **Frontend**: [React](https://react.dev/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Flask](https://flask.palletsprojects.com/en/stable/), [Ngrok](https://ngrok.com/)

## Getting Started

These instructions will help you set up and run the project locally.

#### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) (v6+)

#### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/agarwalrachit399/Researchify.git
   cd Researchify
   ```
2. **Setup Backend**

- Open the Researchify_backend.ipynb file in **[Google Colab](https://colab.research.google.com/)**
- Setup the following API Keys in Colab Secret

  ```bash
  COHERE_API_KEY
  NGROK_AUTH_TOKEN
  OPENAI_API_KEY
  SS_API_KEY (semantic scholar API key [optional])
  ``` 
- Switch Runtime to **T4 GPU** and run all cells (Free tier is sufficient)
- **Copy the Ngrok URL** for the local frontend to communicate with Colab

2. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
3. **Env Configuration**:
In the frontend folder create a .env file and add

   ```bash
   NEXT_PUBLIC_NGROK_URL=your_ngrok_url_from_flask_app
   ```

#### Usage

1. **Development Server**:
- To start your application in development mode, run:

  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:3000`.