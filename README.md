# Fishopedia Kiosk

An interactive digital kiosk application designed to display educational information about marine life. Built with vanilla HTML, CSS, and JavaScript, it features a touch-friendly interface suitable for tablet or touchscreen displays.

[**View Live Demo**](https://<YOUR_USERNAME>.github.io/fishopedia-kiosk/)

## Features

*   **Interactive Carousel**: Smooth horizontal scrolling card interface to browse different fish species.
*   **Multi-Language Support**: Instantly switch between English, Bahasa Indonesia, Chinese, Russian, and Korean.
*   **Immersive Detail View**:
    *   **Dark Mode Interface**: Optimized for viewing in low-light aquarium settings.
    *   **Hero Header**: Full-screen fish image with a quick status badge.
    *   **Structured Content**: Split sections for Fun Facts and Habitat/Lifestyle.
    *   **Conservation Scale**: A visual timeline showing the IUCN conservation status (Extinct to Least Concern).
*   **Kiosk Mode**: Includes an idle timer that automatically resets the view to the beginning and defaults to English after 45 seconds of inactivity.
*   **Responsive Design**: Optimized for tablet browsers using dynamic viewport units (`dvh`).

## Setup & Usage

1.  Clone the repository.
2.  Ensure the `images` folder contains the necessary fish images and flag icons.
3.  Open `index.html` in any modern web browser.
4.  For a true kiosk experience, run the browser in Full Screen mode (usually F11).

## Customization

### Adding New Fish
To add more entries, edit the `data.json` file. Add a new object to the `fish` array:

**Note on Text Formatting:** The `facts` field uses a double newline (`\n\n`) to separate the "Fun Fact" section from the "Habitat & Lifestyle" section.

```json
{
  "id": "fish_unique_id",
  "image": "images/your_image.jpg",
  "names": {
    "en": "Name in English",
    "ba": "Name in Bahasa",
    "cn": "Name in Chinese",
    "ru": "Name in Russian",
    "ko": "Name in Korean"
  },
  "conservation": "LC",
  "facts": {
    "en": "First paragraph is the Fun Fact.\n\nSecond paragraph is Habitat & Lifestyle.",
    "ba": "..."
  },
  "short_facts": {
    "en": "A one-sentence summary for the hero image overlay."
  }
}
```

### Changing Settings
You can adjust the idle timeout duration in `data.json` under the `settings` object:

```json
"settings": {
  "idleTimeoutSeconds": 45,
  "defaultLanguage": "en"
}
```

## Technologies

*   HTML5
*   CSS3 (Flexbox, Scroll Snap, Animations)
*   JavaScript (ES6+, Fetch API)