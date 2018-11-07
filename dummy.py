from flask import Flask, render_template
# In[ ]:
app = Flask(__name__)
@app.route("/")
@app.route("/home")

def home():
    return render_template('index.html')
@app.route("/hi")
def hi():
    return "Yerrr"

if __name__ == '__main__':
    app.run(debug=True)