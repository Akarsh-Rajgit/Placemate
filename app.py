import streamlit as st
import joblib
import docx2txt
import PyPDF2


st.set_page_config(page_title="Resume Job Prediction", layout="centered")

# Load vectorizer and models
vectorizer = joblib.load("tfidf_vectorizer.pkl")
nb_model = joblib.load("naive_bayes_resume.pkl")
logreg_model = joblib.load("logreg_resume.pkl")

def extract_text(file):
    text = ""
    filename = file.name.lower()

    if filename.endswith(".pdf"):
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    elif filename.endswith(".docx"):
        import docx2txt
        text = docx2txt.process(file)
    elif filename.endswith(".txt"):
        text = file.read().decode("utf-8")
    return text


st.title("📄 Resume Job Prediction")
st.write("Upload your resume to see the predicted job role!")

uploaded_file = st.file_uploader("Upload Resume", type=["pdf", "docx", "txt"])

if uploaded_file is not None:
    resume_text = extract_text(uploaded_file)

    if resume_text.strip():
        # Convert resume text into vector
        features = vectorizer.transform([resume_text])

        # Predictions
        nb_pred = nb_model.predict(features)[0]
        logreg_pred = logreg_model.predict(features)[0]

        st.write(f"**Naive Bayes Prediction:** {nb_pred}")
        st.write(f"**Logistic Regression Prediction:** {logreg_pred}")
    else:
        st.warning("Could not extract text from this file. Try another format.")