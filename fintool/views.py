from django.shortcuts import render,HttpResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import get_pdf_text, get_text_chunks_with_metadata, get_vectorstore, get_conversation_chain


@login_required
def home(request):
    return render(request, 'home.html')


def chatbot_view(request):
    return render(request, "chatbot.html")

@csrf_exempt
def chatbot_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_input = data.get("question", "")
            uploaded_files = request.FILES.getlist("files")  # Handle file uploads
            
            # Step 1: Process uploaded files (if any)
            if uploaded_files:
                raw_text, filenames = get_pdf_text(uploaded_files)
                text_chunks_with_metadata = get_text_chunks_with_metadata(raw_text, filenames)
                vectorstore = get_vectorstore(text_chunks_with_metadata)
            else:
                return JsonResponse({"error": "No files uploaded."}, status=400)
            
            # Step 2: Load conversation chain
            conversation_chain = get_conversation_chain(vectorstore)

            # Step 3: Get response
            response = conversation_chain({'question': user_input})
            return JsonResponse({"answer": response["answer"]}, safe=False)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method. Use POST."}, status=405)