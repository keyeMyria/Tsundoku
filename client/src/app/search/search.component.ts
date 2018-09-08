import axios from 'axios';
import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { ResolvedBook } from 'shared/entity';

declare var $: any;

/**
 * 本の検索画面
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {

  hitBooks: ResolvedBook[] = [];
  content = '';

  /**
   * FirebaseService のプロパティの参照を取得するプロパティ
   * @type {firebase.functions.Functions}
   * @memberof TopComponent
   */
  public functions: firebase.functions.Functions;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.functions = this.firebaseService.functions;
  }

  search(isbn: string) {
    if ((isbn.length !== 10) && (isbn.length !== 13)) {
      $('#errorModal').modal();
      return;
    }

    const searchBooksInFirestore = (clue: string): Promise<ResolvedBook[]> =>
      this.functions.httpsCallable('searchBooksByISBN')({isbn: clue, usingGoogleBooksAPI: false})
        .then(result => result.data)
        .catch(error => error);

    axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      .then(async result => {
        if (result.data.totalItems > 0) {
          // ヒットした場合は取り出してサムネを出力する
          this.hitBooks = [];

          for (let i = 0; i < result.data.items.length; i++) {
            const volumeInfo = result.data.items[i].volumeInfo,
                  hitBook: ResolvedBook = {
                    desc: volumeInfo.description,
                    donor: 'none',
                    image: './assets/image_not_found.png',
                    isbn,
                    title: volumeInfo.title
                  };

            if (volumeInfo.imageLinks === void 0) {
              const books = await searchBooksInFirestore(isbn);
              if (books.length > 0) {
                hitBook.donor = books[0].donor;
                hitBook.image = books[0].image;
              }
            } else {
              hitBook.image = `https${volumeInfo.imageLinks.smallThumbnail.slice(4)}`;
            }

            this.hitBooks.push(hitBook);
          }
        } else {
          // ヒットしなかった場合は resolvedBooks で検索する
          this.hitBooks = await searchBooksInFirestore(isbn);
        }
      })
      .catch(error => `Error: ${error}`);
  }
}
