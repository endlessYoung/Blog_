export function initCardTransform() {
    const articles = document.querySelectorAll("article"); // 获取所有的 article 元素

    console.log("articles", articles);

    articles.forEach((article) => {
        article.addEventListener("mousemove", (e: MouseEvent) => {
            const { width, height, left, top } = article.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            const centerX = width / 2;
            const centerY = height / 2;

            const deltaX = x - centerX;
            const deltaY = y - centerY;

            const rotateX = -(deltaY / centerY) * 20;  // 鼠标在垂直方向上的偏移反向旋转
            const rotateY = (deltaX / centerX) * 20;   // 鼠标在水平方向上的偏移反向旋转

            article.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        article.addEventListener("mouseleave", () => {
            article.style.transition = 'transform 0.3s ease-out';
            article.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });
}