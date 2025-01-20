from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from InstructorEmbedding import INSTRUCTOR
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain_groq import ChatGroq
import os

def get_pdf_text(pdf_files):
    text = []
    filenames = []
    for pdf in pdf_files:
        pdf_reader = PdfReader(pdf)
        filenames.append(pdf.name)  # Get the filename
        file_text = []
        for page in pdf_reader.pages:
            file_text.append(page.extract_text())
        text.append(file_text)
    return text, filenames

def get_text_chunks_with_metadata(text, filenames):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    text_chunks = []
    for pdf_index, pdf_text in enumerate(text):
        pdf_name = filenames[pdf_index]
        for page_number, page_text in enumerate(pdf_text):
            chunks = text_splitter.split_text(page_text)
            for chunk in chunks:
                text_chunks.append({
                    "chunk": chunk,
                    "metadata": {
                        "page_number": page_number + 1,
                        "pdf_name": pdf_name  # Store the PDF name
                    }
                })
    return text_chunks

def get_vectorstore(text_chunks_with_metadata):
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    texts = [item["chunk"] for item in text_chunks_with_metadata]
    metadata = [item["metadata"] for item in text_chunks_with_metadata]
    vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=metadata)
    return vectorstore

def get_conversation_chain(vectorstore):
    groq_chat = ChatGroq(
        groq_api_key=os.environ.get("GROQ_API_KEY"), 
        model_name="llama3-8b-8192"
    )
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=groq_chat,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        memory=memory
    )
    return conversation_chain