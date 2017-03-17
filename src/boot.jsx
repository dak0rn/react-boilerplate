import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

const stdout = document.querySelector('main');
const renderApp = function() {
    return render(<AppContainer>
                      <App />
                  </AppContainer>,
                  stdout);
};

renderApp();

if(module.hot)
    module.hot.accept('./App', renderApp);
