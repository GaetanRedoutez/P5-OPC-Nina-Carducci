/**
 * 
 * @param {*} options 
 * @returns {void} 
 */
function mauGallery(selector, options) {
  var element = document.querySelector(selector);
  var options = Object.assign({}, mauGallery.defaults, options);
  var tagsCollection = [];

  createRowWrapper(element);

  if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
  }

  listeners(options);

  Array.from(element.children).forEach(function (child) {
      if (child.classList.contains("gallery-item")) {
          responsiveImageItem(child);
          moveItemInRowWrapper(child);
          wrapItemInColumn(child, options.columns);
          var theTag = child.dataset.galleryTag;
          if (
              options.showTags &&
              theTag !== undefined &&
              tagsCollection.indexOf(theTag) === -1
          ) {
              tagsCollection.push(theTag);
          }
      }
  });

  if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
  }

  element.style.display = 'block';

  function createRowWrapper(element) {
      if (!element.children[0] || !element.children[0].classList.contains("row")) {
          var rowWrapper = document.createElement("div");
          rowWrapper.classList.add("gallery-items-row", "row");
          element.appendChild(rowWrapper);
      }
  }

  function wrapItemInColumn(element, columns) {
    var columnClasses = [];
    if (columns.constructor === Number) {
        columnClasses.push(`col-${Math.ceil(12 / columns)}`);
    } else if (columns.constructor === Object) {
        if (columns.xs) columnClasses.push(`col-${Math.ceil(12 / columns.xs)}`);
        if (columns.sm) columnClasses.push(`col-sm-${Math.ceil(12 / columns.sm)}`);
        if (columns.md) columnClasses.push(`col-md-${Math.ceil(12 / columns.md)}`);
        if (columns.lg) columnClasses.push(`col-lg-${Math.ceil(12 / columns.lg)}`);
        if (columns.xl) columnClasses.push(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
    }

    if (columnClasses.length > 0) {
        var columnWrapper = document.createElement("div");
        columnWrapper.classList.add("item-column", "mb-4", ...columnClasses);
        element.parentNode.insertBefore(columnWrapper, element);
        columnWrapper.appendChild(element);
    } else {
        console.error("No valid classes found for wrapping the item in a column.");
    }
}


  function moveItemInRowWrapper(element) {
      element.parentNode.querySelector(".gallery-items-row").appendChild(element);
  }

  function responsiveImageItem(element) {
      if (element.tagName === "IMG") {
          element.classList.add("img-fluid");
      }
  }

  function createLightBox(gallery, lightboxId, navigation) {
      var lightbox = document.createElement("div");
      lightbox.classList.add("modal", "fade");
      lightbox.id = lightboxId || "galleryLightbox";
      lightbox.tabIndex = -1;
      lightbox.role = "dialog";
      lightbox.setAttribute("aria-hidden", true);

      var modalDialog = document.createElement("div");
      modalDialog.classList.add("modal-dialog");
      modalDialog.role = "document";

      var modalContent = document.createElement("div");
      modalContent.classList.add("modal-content");

      var modalBody = document.createElement("div");
      modalBody.classList.add("modal-body");

      if (navigation) {
          var prevButton = document.createElement("div");
          prevButton.classList.add("mg-prev");
          prevButton.style.cursor = "pointer";
          prevButton.style.position = "absolute";
          prevButton.style.top = "50%";
          prevButton.style.left = "-15px";
          prevButton.style.background = "white";
          prevButton.innerHTML = "&lt;";
          modalBody.appendChild(prevButton);
      }

      var lightboxImage = document.createElement("img");
      lightboxImage.classList.add("lightboxImage", "img-fluid");
      lightboxImage.alt = "Contenu de l'image affichée dans la modale au clique";
      modalBody.appendChild(lightboxImage);

      if (navigation) {
          var nextButton = document.createElement("div");
          nextButton.classList.add("mg-next");
          nextButton.style.cursor = "pointer";
          nextButton.style.position = "absolute";
          nextButton.style.top = "50%";
          nextButton.style.right = "-15px";
          nextButton.style.background = "white";
          nextButton.innerHTML = "&gt;";
          modalBody.appendChild(nextButton);
      }

      modalContent.appendChild(modalBody);
      modalDialog.appendChild(modalContent);
      lightbox.appendChild(modalDialog);

      gallery.appendChild(lightbox);
  }

  function showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      tags.forEach(function (value) {
          tagItems += `<li class="nav-item active">
              <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
          gallery.insertAdjacentHTML('beforeend', tagsRow);
      } else if (position === "top") {
          gallery.insertAdjacentHTML('afterbegin', tagsRow);
      } else {
          console.error(`Unknown tags position: ${position}`);
      }
  }

  function listeners(options) {
      element.addEventListener("click", function (event) {
          var target = event.target;
          if (options.lightBox && target.tagName === "IMG") {
              openLightBox(target, options.lightboxId);
          } else {
              return;
          }
      });

      gallery.addEventListener("click", function (event) {
          var target = event.target;
          if (target.classList.contains("nav-link")) {
              filterByTag(target);
          } else if (target.classList.contains("mg-prev")) {
              prevImage();
          } else if (target.classList.contains("mg-next")) {
              nextImage();
          }
      });
  }

  function openLightBox(element, lightboxId) {
      var lightbox = document.getElementById(lightboxId);
      lightbox.querySelector(".lightboxImage").src = element.src;
      lightbox.classList.add("show");
      lightbox.style.display = "block";
  }

  function prevImage() {
      var activeImage = null;
      Array.from(document.querySelectorAll("img.gallery-item")).forEach(function (img) {
          if (img.src === document.querySelector(".lightboxImage").src) {
              activeImage = img;
          }
      });

      var activeTag = document.querySelector(".tags-bar span.active-tag").dataset.imagesToggle;
      var imagesCollection = [];

      if (activeTag === "all") {
          Array.from(document.querySelectorAll(".item-column img")).forEach(function (img) {
              imagesCollection.push(img);
          });
      } else {
          Array.from(document.querySelectorAll(".item-column img")).forEach(function (img) {
              if (img.dataset.galleryTag === activeTag) {
                  imagesCollection.push(img);
              }
          });
      }

      var index = 0,
          next = null;

      imagesCollection.forEach(function (img, i) {
          if (activeImage.src === img.src) {
              index = i - 1;
          }
      });

      next = imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
      document.querySelector(".lightboxImage").src = next.src;
  }

  function nextImage() {
      var activeImage = null;
      Array.from(document.querySelectorAll("img.gallery-item")).forEach(function (img) {
          if (img.src === document.querySelector(".lightboxImage").src) {
              activeImage = img;
          }
      });

      var activeTag = document.querySelector(".tags-bar span.active-tag").dataset.imagesToggle;
      var imagesCollection = [];

      if (activeTag === "all") {
          Array.from(document.querySelectorAll(".item-column img")).forEach(function (img) {
              imagesCollection.push(img);
          });
      } else {
          Array.from(document.querySelectorAll(".item-column img")).forEach(function (img) {
              if (img.dataset.galleryTag === activeTag) {
                  imagesCollection.push(img);
              }
          });
      }

      var index = 0,
          next = null;

      imagesCollection.forEach(function (img, i) {
          if (activeImage.src === img.src) {
              index = i + 1;
          }
      });

      next = imagesCollection[index] || imagesCollection[0];
      document.querySelector(".lightboxImage").src = next.src;
  }

}

mauGallery.defaults = {
  columns: 3,
  lightBox: true,
  lightboxId: null,
  showTags: true,
  tagsPosition: "bottom",
  navigation: true
};

// (function ($) {

//     /**
//      * 
//      * @param {*} options 
//      * @returns {void} 
//      */
//     $.fn.mauGallery = function (options) {
//         var options = $.extend($.fn.mauGallery.defaults, options);
//         var tagsCollection = [];

//         return this.each(function () {
//             $.fn.mauGallery.methods.createRowWrapper($(this));

//             if (options.lightBox) {
//                 $.fn.mauGallery.methods.createLightBox(
//                     $(this),
//                     options.lightboxId,
//                     options.navigation
//                 );
//             }

//             $.fn.mauGallery.listeners(options);

//             $(this)
//                 .children(".gallery-item")
//                 .each(function (index) {
//                     $.fn.mauGallery.methods.responsiveImageItem($(this));
//                     $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
//                     $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
//                     var theTag = $(this).data("gallery-tag");
//                     if (
//                         options.showTags &&
//                         theTag !== undefined &&
//                         tagsCollection.indexOf(theTag) === -1
//                     ) {
//                         tagsCollection.push(theTag);
//                     }
//                 });

//             if (options.showTags) {
//                 $.fn.mauGallery.methods.showItemTags(
//                     $(this),
//                     options.tagsPosition,
//                     tagsCollection
//                 );
//             }

//             $(this).fadeIn(500);
//         });
//     };

//     $.fn.mauGallery.defaults = {
//         columns: 3,
//         lightBox: true,
//         lightboxId: null,
//         showTags: true,
//         tagsPosition: "bottom",
//         navigation: true
//     };

//     /**
//      * 
//      * @param {*} options 
//      */
//     $.fn.mauGallery.listeners = function (options) {
//         $(".gallery-item").on("click", function () {
//             if (options.lightBox && $(this).prop("tagName") === "IMG") {
//                 $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
//             } else {
//                 return;
//             }
//         });

//         $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
//         $(".gallery").on("click", ".mg-prev", () =>
//             $.fn.mauGallery.methods.prevImage(options.lightboxId)
//         );
//         $(".gallery").on("click", ".mg-next", () =>
//             $.fn.mauGallery.methods.nextImage(options.lightboxId)
//         );
//     };

//     /**
//      * 
//      */
//     $.fn.mauGallery.methods = {
//         createRowWrapper(element) {
//             if (
//                 !element
//                     .children()
//                     .first()
//                     .hasClass("row")
//             ) {
//                 element.append('<div class="gallery-items-row row"></div>');
//             }
//         },

//         wrapItemInColumn(element, columns) {
//             if (columns.constructor === Number) {
//                 element.wrap(
//                     `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
//                 );
//             } else if (columns.constructor === Object) {
//                 var columnClasses = "";
//                 if (columns.xs) {
//                     columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
//                 }
//                 if (columns.sm) {
//                     columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
//                 }
//                 if (columns.md) {
//                     columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
//                 }
//                 if (columns.lg) {
//                     columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
//                 }
//                 if (columns.xl) {
//                     columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
//                 }
//                 element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
//             } else {
//                 console.error(
//                     `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
//                 );
//             }
//         },

//         moveItemInRowWrapper(element) {
//             element.appendTo(".gallery-items-row");
//         },

//         responsiveImageItem(element) {
//             if (element.prop("tagName") === "IMG") {
//                 element.addClass("img-fluid");
//             }
//         },

//         openLightBox(element, lightboxId) {
//             $(`#${lightboxId}`)
//                 .find(".lightboxImage")
//                 .attr("src", element.attr("src"));
//             $(`#${lightboxId}`).modal("toggle");
//         },

//         prevImage() {

//             let activeImage = null;

//             $("img.gallery-item").each(function () {
//                 if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
//                     activeImage = $(this);
//                 }
//             });

//             let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
//             let imagesCollection = [];

//             if (activeTag === "all") {

//                 $(".item-column").each(function () {
//                     if ($(this).children("img").length) {
//                         imagesCollection.push($(this).children("img"));
//                     }
//                 });
//             } else {
//                 $(".item-column").each(function () {
//                     if (
//                         $(this)
//                             .children("img")
//                             .data("gallery-tag") === activeTag
//                     ) {
//                         imagesCollection.push($(this).children("img"));
//                     }
//                 });
//             }
//             let index = 0,
//                 next = null;

//             $(imagesCollection).each(function (i) {
//                 if ($(activeImage).attr("src") === $(this).attr("src")) {
//                     index = i - 1;
//                 }
//             });
//             next =
//                 imagesCollection[index] ||
//                 imagesCollection[imagesCollection.length - 1];
//             $(".lightboxImage").attr("src", $(next).attr("src"));
//         },

//         nextImage() {

//             let activeImage = null;
//             $("img.gallery-item").each(function () {
//                 if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
//                     activeImage = $(this);
//                 }
//             });
//             let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
//             let imagesCollection = [];
//             if (activeTag === "all") {
//                 $(".item-column").each(function () {
//                     if ($(this).children("img").length) {
//                         imagesCollection.push($(this).children("img"));
//                     }
//                 });
//             } else {
//                 $(".item-column").each(function () {
//                     if (
//                         $(this)
//                             .children("img")
//                             .data("gallery-tag") === activeTag
//                     ) {
//                         imagesCollection.push($(this).children("img"));
//                     }
//                 });
//             }
//             let index = 0,
//                 next = null;

//             $(imagesCollection).each(function (i) {
//                 if ($(activeImage).attr("src") === $(this).attr("src")) {
//                     index = i + 1;
//                 }
//             });
//             next = imagesCollection[index] || imagesCollection[0];
//             $(".lightboxImage").attr("src", $(next).attr("src"));
//         },

//         createLightBox(gallery, lightboxId, navigation) {
//             gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"
//                 }" tabindex="-1" role="dialog" aria-hidden="true">
//                 <div class="modal-dialog" role="document">
//                     <div class="modal-content">
//                         <div class="modal-body">
//                             ${navigation
//                     ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
//                     : '<span style="display:none;" />'
//                 }
//                             <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
//                             ${navigation
//                     ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
//                     : '<span style="display:none;" />'
//                 }
//                         </div>
//                     </div>
//                 </div>
//             </div>`);
//         },

//         showItemTags(gallery, position, tags) {

//             var tagItems =
//                 '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
//             $.each(tags, function (index, value) {
//                 tagItems += `<li class="nav-item active">
//                 <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
//             });
//             var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

//             if (position === "bottom") {
//                 gallery.append(tagsRow);
//             } else if (position === "top") {
//                 gallery.prepend(tagsRow);
//             } else {
//                 console.error(`Unknown tags position: ${position}`);
//             }
//         },

//         filterByTag() {

//             if ($(this).hasClass("active-tag")) {
//                 return;
//             }

//             $(".active-tag").removeClass("active active-tag");

//             $(this).addClass("active active-tag");

//             var tag = $(this).data("images-toggle");

//             $(".gallery-item").each(function () {
//                 $(this)
//                     .parents(".item-column")
//                     .hide();
//                 if (tag === "all") {
//                     $(this)
//                         .parents(".item-column")
//                         .show(300);
//                 } else if ($(this).data("gallery-tag") === tag) {
//                     $(this)
//                         .parents(".item-column")
//                         .show(300);
//                 }
//             });
//         }
//     };
// })(jQuery);
